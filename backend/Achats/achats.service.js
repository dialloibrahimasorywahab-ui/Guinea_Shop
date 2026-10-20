import AchatRepository from "./achats.repositories.js";
import LigneAchatRepository from "../Ligne_achat/ligne_achat.repositories.js";
import ArticleRepository from "../articles/articles.repositories.js";
import MouvementStockRepository from "../Mouvement_stock/mouvement_stock.repositories.js";
import FinanceRepository from "../Finances/finances.repositories.js";
import FournisseurRepository from "../fournisseur/fournisseur.repositories.js";
import runInTransaction from "../common/db/transaction.js";
import nextNumber from "../common/utils/counter.js";

class AchatService {
  /**
   * Création d'un achat fournisseur avec transaction ACID,
   * mise à jour atomique des stocks et traçabilité MouvementStock
   */
  static createAchat = async (data) => {
    return await runInTransaction(async (session) => {
      const { fournisseur_id, user_id, items, statut, statutPaiement } = data;

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("Un achat doit contenir au moins un article");
      }

      // 1. Vérification du fournisseur
      if (fournisseur_id) {
        const fournisseur = await FournisseurRepository.getFournisseurById(fournisseur_id);
        if (!fournisseur) {
          throw new Error(`Fournisseur ID ${fournisseur_id} introuvable`);
        }
      }

      // 2. Regroupement par article (évite les doublons)
      const articlesMap = new Map();
      for (const item of items) {
        if (!item.article_id || !item.quantite || Number(item.quantite) <= 0) {
          throw new Error("Chaque ligne d'achat doit avoir un article_id valide et une quantité positive");
        }
        const key = String(item.article_id);
        const existing = articlesMap.get(key) || { quantite: 0, prixAchatUnitaire: Number(item.prixAchatUnitaire || 0) };
        articlesMap.set(key, {
          quantite: existing.quantite + Math.floor(Number(item.quantite)),
          prixAchatUnitaire: Number(item.prixAchatUnitaire || existing.prixAchatUnitaire),
        });
      }

      // 3. Validation des articles et calcul du montant total
      let montantTotal = 0;
      const linesToPrepare = [];

      for (const [articleId, info] of articlesMap.entries()) {
        const article = await ArticleRepository.getArticleById(articleId, session);
        if (!article) {
          throw new Error(`Article ID ${articleId} introuvable`);
        }

        const sousTotal = info.quantite * info.prixAchatUnitaire;
        montantTotal += sousTotal;

        linesToPrepare.push({
          article_id: article._id,
          libelle: article.libelle,
          quantite: info.quantite,
          prixAchatUnitaire: info.prixAchatUnitaire,
          sousTotal,
          quantiteAvant: article.quantiteEnStock,
        });
      }

      // 4. Numéro séquentiel garanti
      const year = new Date().getFullYear();
      const seq = await nextNumber(`achat-${year}`, session);
      const purchaseNum = `ACH-${year}-${String(seq).padStart(6, '0')}`;

      const currentStatut = statut || 'reçu';
      const currentStatutPaiement = statutPaiement || 'impayé';

      // 5. Création de l'entête d'achat
      const newAchat = await AchatRepository.createAchat(
        {
          numeroAchat: purchaseNum,
          fournisseur_id,
          user_id,
          montantTotal,
          statut: currentStatut,
          statutPaiement: currentStatutPaiement,
        },
        session
      );

      // 6. Traitement des lignes d'achat et mouvement de stock
      const createdLines = [];
      for (const line of linesToPrepare) {
        let quantiteApres = line.quantiteAvant;

        if (currentStatut === 'reçu') {
          const updated = await ArticleRepository.incrementStock(line.article_id, line.quantite, session);
          quantiteApres = updated ? updated.quantiteEnStock : line.quantiteAvant + line.quantite;

          await MouvementStockRepository.createMouvement(
            {
              article_id: line.article_id,
              user_id,
              typeMouvement: 'entrée',
              quantite: line.quantite,
              quantiteAvant: line.quantiteAvant,
              quantiteApres,
              motif: `Approvisionnement Achat N° ${purchaseNum}`,
              achat_id: newAchat._id,
              dateMouvement: new Date(),
            },
            session
          );
        }

        const createdLine = await LigneAchatRepository.createLigneAchat(
          {
            achat_id: newAchat._id,
            article_id: line.article_id,
            quantite: line.quantite,
            prixAchatUnitaire: line.prixAchatUnitaire,
            sousTotal: line.sousTotal,
          },
          session
        );
        createdLines.push(createdLine);
      }

      // 7. Si statutPaiement est 'payé', enregistrer la dépense correspondante dans Finances
      if (currentStatutPaiement === 'payé') {
        await FinanceRepository.createTransaction(
          {
            type: 'dépense',
            categorie: 'achat',
            montant: montantTotal,
            modePaiement: 'virement',
            description: `Règlement Achat N° ${purchaseNum}`,
            user_id,
            achat_id: newAchat._id,
            dateTransaction: new Date(),
          },
          session
        );
      }

      const fullAchat = await AchatRepository.getAchatById(newAchat._id, session);
      return {
        achat: fullAchat,
        lignesAchat: createdLines,
      };
    });
  };

  /**
   * Annulation propre d'un achat :
   * Décrémente le stock sans écrêtage masqué
   */
  static annulerAchat = async (id, operatorUserId = null) => {
    return await runInTransaction(async (session) => {
      const achat = await AchatRepository.getAchatById(id, session);
      if (!achat) {
        throw new Error(`Achat ID ${id} introuvable`);
      }

      if (achat.statut === 'annulé') {
        throw new Error("Cet achat est déjà annulé");
      }

      const lignes = await LigneAchatRepository.getLignesByAchatId(id, session);

      // Si les articles avaient été reçus en stock, déduire les quantités de façon stricte
      if (achat.statut === 'reçu') {
        for (const ligne of lignes) {
          const articleId = ligne.article_id?._id || ligne.article_id;
          const article = await ArticleRepository.getArticleById(articleId, session);
          if (!article) {
            throw new Error(`Article ID ${articleId} introuvable`);
          }

          if (article.quantiteEnStock < ligne.quantite) {
            throw new Error(
              `Impossible d'annuler l'achat : une partie du stock de "${article.libelle}" a déjà été vendue (Stock actuel: ${article.quantiteEnStock}, Quantité de l'achat: ${ligne.quantite})`
            );
          }

          const quantiteAvant = article.quantiteEnStock;
          const updated = await ArticleRepository.decrementStock(articleId, ligne.quantite, session);

          await MouvementStockRepository.createMouvement(
            {
              article_id: article._id,
              user_id: operatorUserId || achat.user_id,
              typeMouvement: 'sortie',
              quantite: ligne.quantite,
              quantiteAvant,
              quantiteApres: updated.quantiteEnStock,
              motif: `Annulation Achat N° ${achat.numeroAchat}`,
              achat_id: achat._id,
              dateMouvement: new Date(),
            },
            session
          );
        }
      }

      // Mettre à jour le statut
      const updatedAchat = await AchatRepository.updateAchat(id, { statut: 'annulé' }, session);

      return {
        achat: updatedAchat,
        message: "Achat annulé avec succès et stocks ajustés",
      };
    });
  };

  static getAchatById = async (id) => {
    const achat = await AchatRepository.getAchatById(id);
    if (!achat) return null;
    const lignes = await LigneAchatRepository.getLignesByAchatId(id);
    return {
      achat,
      lignesAchat: lignes,
    };
  };

  static getAllAchats = async (queryParams = {}) => {
    return await AchatRepository.getAllAchats(queryParams);
  };

  static getAchatsByFournisseur = async (fournisseurId) => {
    return await AchatRepository.getAchatsByFournisseur(fournisseurId);
  };

  static updateAchat = async (id, update) => {
    return await AchatRepository.updateAchat(id, update);
  };

  static deleteAchat = async (id, operatorUserId = null) => {
    return await this.annulerAchat(id, operatorUserId);
  };

  static deleteAchatById = async (id, operatorUserId = null) => {
    return await this.deleteAchat(id, operatorUserId);
  };
}

export default AchatService;
