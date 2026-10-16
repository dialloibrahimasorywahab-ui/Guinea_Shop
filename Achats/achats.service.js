import mongoose from "mongoose";
import AchatRepository from "./achats.repositories.js";
import LigneAchatRepository from "../Ligne_achat/ligne_achat.repositories.js";
import ArticleRepository from "../articles/articles.repositories.js";
import MouvementStockRepository from "../Mouvement_stock/mouvement_stock.repositories.js";
import FinanceRepository from "../Finances/finances.repositories.js";

class AchatService {
  /**
   * Création d'un achat fournisseur avec transaction ACID,
   * mise à jour automatique des stocks, traçabilité MouvementStock et impact Finance si payé
   */
  static createAchat = async (data) => {
    const { fournisseur_id, user_id, items, numeroAchat, statut, statutPaiement } = data;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Un achat doit contenir au moins un article");
    }

    const purchaseNum =
      numeroAchat || `ACH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const session = await mongoose.startSession();
    let isTransactionActive = false;

    try {
      try {
        session.startTransaction();
        isTransactionActive = true;
      } catch (e) {
        isTransactionActive = false;
      }

      const sessionOption = isTransactionActive ? session : null;

      let montantTotal = 0;
      const linesToPrepare = [];

      // 1. Valider les articles et calculer le montant total
      for (const item of items) {
        const article = await ArticleRepository.getArticleById(item.article_id, sessionOption);
        if (!article) {
          throw new Error(`Article ID ${item.article_id} introuvable`);
        }

        const sousTotal = Number(item.quantite) * Number(item.prixAchatUnitaire);
        montantTotal += sousTotal;

        linesToPrepare.push({
          article,
          article_id: item.article_id,
          quantite: Number(item.quantite),
          prixAchatUnitaire: Number(item.prixAchatUnitaire),
          sousTotal,
        });
      }

      // 2. Création de l'entête d'achat
      const currentStatut = statut || 'reçu';
      const currentStatutPaiement = statutPaiement || 'impayé';

      const newAchat = await AchatRepository.createAchat(
        {
          numeroAchat: purchaseNum,
          fournisseur_id,
          user_id,
          montantTotal,
          statut: currentStatut,
          statutPaiement: currentStatutPaiement,
        },
        sessionOption
      );

      // 3. Traitement des lignes d'achat et mouvement de stock (entrée)
      const createdLines = [];
      for (const line of linesToPrepare) {
        // Si l'achat est réceptionné, incrémenter le stock de l'article
        if (currentStatut === 'reçu') {
          line.article.quantiteEnStock += line.quantite;
          await line.article.save(sessionOption ? { session: sessionOption } : undefined);

          // Traçabilité : Enregistrement du mouvement de stock ENTRÉE
          await MouvementStockRepository.createMouvement(
            {
              article_id: line.article_id,
              user_id,
              typeMouvement: 'entrée',
              quantite: line.quantite,
              motif: `Approvisionnement Achat N° ${purchaseNum}`,
              achat_id: newAchat._id,
              dateMouvement: new Date(),
            },
            sessionOption
          );
        }

        // Création de la ligne d'achat
        const createdLine = await LigneAchatRepository.createLigneAchat(
          {
            achat_id: newAchat._id,
            article_id: line.article_id,
            quantite: line.quantite,
            prixAchatUnitaire: line.prixAchatUnitaire,
            sousTotal: line.sousTotal,
          },
          sessionOption
        );

        createdLines.push(createdLine);
      }

      // 4. Si l'achat est payé immédiatement, enregistrement dans le grand livre Finances (dépense)
      if (currentStatutPaiement === 'payé') {
        await FinanceRepository.createTransaction(
          {
            type: 'dépense',
            categorie: 'achat',
            montant: montantTotal,
            description: `Paiement direct Achat N° ${purchaseNum}`,
            user_id,
            achat_id: newAchat._id,
            modePaiement: 'espèces',
            dateTransaction: new Date(),
          },
          sessionOption
        );
      }

      if (isTransactionActive) {
        await session.commitTransaction();
      }

      const fullAchat = await AchatRepository.getAchatById(newAchat._id);
      return {
        achat: fullAchat,
        lignesAchat: createdLines,
      };
    } catch (error) {
      if (isTransactionActive) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      await session.endSession();
    }
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

  static getAllAchats = async () => {
    return await AchatRepository.getAllAchats();
  };

  static getAchatsByFournisseur = async (fournisseurId) => {
    return await AchatRepository.getAchatsByFournisseur(fournisseurId);
  };

  static updateAchat = async (id, update) => {
    return await AchatRepository.updateAchat(id, update);
  };

  /**
   * Annulation d'un achat :
   * Décrémente le stock réintégré et enregistre le mouvement de stock compensatoire
   */
  static deleteAchat = async (id, operatorUserId = null) => {
    const achat = await AchatRepository.getAchatById(id);
    if (!achat) return null;

    const lignes = await LigneAchatRepository.getLignesByAchatId(id);

    // Si les articles avaient été reçus en stock, déduire les quantités
    if (achat.statut === 'reçu') {
      for (const ligne of lignes) {
        const articleId = ligne.article_id?._id || ligne.article_id;
        const article = await ArticleRepository.getArticleById(articleId);
        if (article) {
          article.quantiteEnStock = Math.max(0, article.quantiteEnStock - ligne.quantite);
          await article.save();

          await MouvementStockRepository.createMouvement({
            article_id: article._id,
            user_id: operatorUserId || achat.user_id,
            typeMouvement: 'sortie',
            quantite: ligne.quantite,
            motif: `Annulation Achat N° ${achat.numeroAchat}`,
            achat_id: achat._id,
            dateMouvement: new Date(),
          });
        }
      }
    }

    await LigneAchatRepository.deleteLignesByAchatId(id);
    return await AchatRepository.deleteAchat(id);
  };

  static deleteAchatById = async (id, operatorUserId = null) => {
    return await this.deleteAchat(id, operatorUserId);
  };
}

export default AchatService;
