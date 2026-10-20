import VenteRepository from "./ventes.repositories.js";
import LigneVenteRepository from "../ligne_ventes/ligne_ventes.repositories.js";
import ArticleRepository from "../articles/articles.repositories.js";
import FactureRepository from "../factures/factures.repositories.js";
import FactureService from "../factures/factures.service.js";
import MouvementStockRepository from "../Mouvement_stock/mouvement_stock.repositories.js";
import ClientRepository from "../clients/clients.repositories.js";
import PaiementRepository from "../paiement/paiement.repositories.js";
import runInTransaction from "../common/db/transaction.js";
import nextNumber from "../common/utils/counter.js";

class VenteService {
  /**
   * Création d'une vente avec transaction ACID, décrémentation atomique et traçabilité des stocks
   */
  static createVente = async (data) => {
    return await runInTransaction(async (session) => {
      const { client_id, user_id, items } = data;

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("Une vente doit contenir au moins un article");
      }

      // 1. Vérification du client (doit exister et être actif)
      if (client_id) {
        const client = await ClientRepository.getClientById(client_id);
        if (!client) {
          throw new Error(`Client ID ${client_id} introuvable`);
        }
        if (client.isActive === false) {
          throw new Error(`Le compte du client "${client.nom} ${client.prenom || ''}" est inactif`);
        }
      }

      // 2. Regroupement des lignes par article_id (évite toute écrasement si un article apparaît deux fois)
      const articlesMap = new Map();
      for (const item of items) {
        if (!item.article_id || !item.quantite || Number(item.quantite) <= 0) {
          throw new Error("Chaque ligne de vente doit avoir un article_id valide et une quantité positive");
        }
        const key = String(item.article_id);
        const currentQty = articlesMap.get(key) || 0;
        articlesMap.set(key, currentQty + Math.floor(Number(item.quantite)));
      }

      // 3. Décrémentation atomique des stocks (une seule requête sans risque de survente)
      let montantTotal = 0;
      const linesToCreate = [];

      for (const [articleId, quantiteDemandee] of articlesMap.entries()) {
        const updatedArticle = await ArticleRepository.decrementStock(articleId, quantiteDemandee, session);
        if (!updatedArticle) {
          // L'article n'existe pas, est inactif ou le stock est insuffisant
          const currentArticle = await ArticleRepository.getArticleById(articleId, session);
          if (!currentArticle) {
            throw new Error(`Article ID ${articleId} introuvable`);
          }
          if (currentArticle.isActive === false) {
            throw new Error(`L'article "${currentArticle.libelle}" est désactivé et ne peut pas être vendu`);
          }
          throw new Error(
            `Stock insuffisant pour l'article "${currentArticle.libelle}". Disponible: ${currentArticle.quantiteEnStock}, Demandé: ${quantiteDemandee}`
          );
        }

        const sousTotal = quantiteDemandee * updatedArticle.prixUnitaire;
        montantTotal += sousTotal;

        linesToCreate.push({
          article_id: updatedArticle._id,
          quantite: quantiteDemandee,
          prixUnitaire: updatedArticle.prixUnitaire,
          sousTotal,
          quantiteApres: updatedArticle.quantiteEnStock,
          quantiteAvant: updatedArticle.quantiteEnStock + quantiteDemandee,
        });
      }

      // 4. Génération séquentielle garantie du numéro de facture (sans collision)
      const year = new Date().getFullYear();
      const seq = await nextNumber(`facture-${year}`, session);
      const invoiceNum = `FAC-${year}-${String(seq).padStart(6, '0')}`;

      // 5. Création de l'entête de la vente (statut initial systématiquement 'en_attente')
      const newVente = await VenteRepository.createVente(
        {
          client_id,
          user_id,
          numeroFacture: invoiceNum,
          montantTotal,
          statut: "en_attente",
        },
        session
      );

      // 6. Enregistrement des lignes et traçabilité des mouvements de stock
      const createdLines = [];
      for (const line of linesToCreate) {
        // Traçabilité du mouvement de stock (sortie)
        await MouvementStockRepository.createMouvement(
          {
            article_id: line.article_id,
            user_id,
            typeMouvement: "sortie",
            quantite: line.quantite,
            quantiteAvant: line.quantiteAvant,
            quantiteApres: line.quantiteApres,
            motif: `Vente N° ${invoiceNum}`,
            vente_id: newVente._id,
            dateMouvement: new Date(),
          },
          session
        );

        // Ligne de vente
        const createdLine = await LigneVenteRepository.createLigneVente(
          {
            vente_id: newVente._id,
            article_id: line.article_id,
            quantite: line.quantite,
            prixUnitaire: line.prixUnitaire,
            sousTotal: line.sousTotal,
          },
          session
        );
        createdLines.push(createdLine);
      }

      // 7. Génération automatique de la facture
      const facture = await FactureService.createFactureFromVente(newVente._id, session);

      const fullVente = await VenteRepository.getVenteById(newVente._id, session);
      return {
        vente: fullVente,
        facture,
        lignesVente: createdLines,
      };
    });
  };

  /**
   * Annulation propre d'une vente (T1.4) :
   * Restaure le stock avec incrementStock, enregistre les entrées compensatoires et passe le statut à 'annulée'
   */
  static annulerVente = async (id, operatorUserId = null) => {
    return await runInTransaction(async (session) => {
      const vente = await VenteRepository.getVenteById(id, session);
      if (!vente) {
        throw new Error(`Vente ID ${id} introuvable`);
      }

      if (vente.statut === 'annulée') {
        throw new Error("Cette vente est déjà annulée");
      }

      const lignes = await LigneVenteRepository.getLignesByVenteId(id, session);

      // 1. Réintégration du stock et enregistrement des mouvements 'entrée'
      for (const ligne of lignes) {
        const articleId = ligne.article_id?._id || ligne.article_id;
        const article = await ArticleRepository.getArticleById(articleId, session);
        if (!article) {
          throw new Error(`L'article ID ${articleId} associé à la ligne n'existe plus en base`);
        }

        const quantiteAvant = article.quantiteEnStock;
        const updated = await ArticleRepository.incrementStock(articleId, ligne.quantite, session);

        await MouvementStockRepository.createMouvement(
          {
            article_id: article._id,
            user_id: operatorUserId || vente.user_id,
            typeMouvement: "entrée",
            quantite: ligne.quantite,
            quantiteAvant,
            quantiteApres: updated.quantiteEnStock,
            motif: `Annulation Vente N° ${vente.numeroFacture}`,
            vente_id: id,
            dateMouvement: new Date(),
          },
          session
        );
      }

      // 2. Mise à jour de la facture
      const facture = await FactureRepository.getFactureByVenteId(id, session);
      if (facture) {
        await FactureRepository.updateFacture(facture._id, { statut: 'annulée' }, session);
      }

      // 3. Statut terminal de la vente
      const updatedVente = await VenteRepository.updateVente(id, { statut: 'annulée' }, session);

      return {
        vente: updatedVente,
        message: "Vente annulée avec succès et stocks réintégrés",
      };
    });
  };

  static getVenteById = async (id) => {
    const vente = await VenteRepository.getVenteById(id);
    if (!vente) return null;
    const lignes = await LigneVenteRepository.getLignesByVenteId(id);
    return {
      vente,
      lignesVente: lignes,
    };
  };

  static getAllVentes = async (queryParams = {}) => {
    return await VenteRepository.getAllVentes(queryParams);
  };

  static getVentesByClient = async (clientId) => {
    return await VenteRepository.getVentesByClient(clientId);
  };

  static getVentesByUser = async (userId) => {
    return await VenteRepository.getVentesByUser(userId);
  };

  /**
   * Modification restreinte d'une vente (T2.4) :
   * Seul le client_id peut être modifié, et seulement si aucun paiement n'existe
   */
  static updateVente = async (id, updateData) => {
    const paiements = await PaiementRepository.getPaiementsByVente(id);
    if (paiements && paiements.length > 0) {
      throw new Error("Impossible de modifier une vente pour laquelle des paiements ont déjà été enregistrés");
    }

    const allowedUpdate = {};
    if (updateData.client_id) {
      const client = await ClientRepository.getClientById(updateData.client_id);
      if (!client) throw new Error("Client introuvable");
      allowedUpdate.client_id = updateData.client_id;
    }

    if (Object.keys(allowedUpdate).length === 0) {
      throw new Error("Seul le client peut être modifié sur une vente en attente de paiement");
    }

    return await VenteRepository.updateVente(id, allowedUpdate);
  };

  /**
   * Suppression bloquée si la vente a une facture ou des paiements (préférer annulerVente)
   */
  static deleteVente = async (id, operatorUserId = null) => {
    const paiements = await PaiementRepository.getPaiementsByVente(id);
    if (paiements && paiements.length > 0) {
      throw new Error("Impossible de supprimer une vente avec des paiements enregistrés. Utilisez l'annulation.");
    }
    return await this.annulerVente(id, operatorUserId);
  };

  static deleteVenteById = async (id, operatorUserId = null) => {
    return await this.deleteVente(id, operatorUserId);
  };
}

export default VenteService;
