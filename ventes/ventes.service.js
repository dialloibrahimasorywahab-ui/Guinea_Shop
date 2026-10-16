import mongoose from "mongoose";
import VenteRepository from "./ventes.repositories.js";
import LigneVenteRepository from "../ligne_ventes/ligne_ventes.repositories.js";
import ArticleRepository from "../articles/articles.repositories.js";
import FactureRepository from "../factures/factures.repositories.js";
import FactureService from "../factures/factures.service.js";
import MouvementStockRepository from "../Mouvement_stock/mouvement_stock.repositories.js";


class VenteService {
  /**
   * Création d'une vente avec transaction ACID et traçabilité complète des stocks
   */
  static createVente = async (data) => {
    const { client_id, user_id, items, numeroFacture, statut } = data;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Une vente doit contenir au moins un article");
    }

    const invoiceNum =
      numeroFacture || `FAC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Initialisation de la session MongoDB pour la transaction ACID
    const session = await mongoose.startSession();
    let isTransactionActive = false;

    try {
      // Démarrage de la transaction si supporté par MongoDB (Replica Set / Atlas)
      try {
        session.startTransaction();
        isTransactionActive = true;
      } catch (e) {
        // En environnement standalone local sans replica set
        isTransactionActive = false;
      }

      const sessionOption = isTransactionActive ? session : null;

      let montantTotal = 0;
      const linesToCreate = [];

      // 1. Vérification des articles et des stocks disponibles
      for (const item of items) {
        const article = await ArticleRepository.getArticleById(item.article_id, sessionOption);
        if (!article) {
          throw new Error(`Article ID ${item.article_id} introuvable`);
        }

        if (article.quantiteEnStock < item.quantite) {
          throw new Error(
            `Stock insuffisant pour l'article "${article.libelle}". Disponible: ${article.quantiteEnStock}, Demandé: ${item.quantite}`
          );
        }

        const sousTotal = item.quantite * article.prixUnitaire;
        montantTotal += sousTotal;

        linesToCreate.push({
          article,
          article_id: item.article_id,
          quantite: item.quantite,
          prixUnitaire: article.prixUnitaire,
          sousTotal,
        });
      }

      // 2. Création de l'entête de la vente
      const newVente = await VenteRepository.createVente(
        {
          client_id,
          user_id,
          numeroFacture: invoiceNum,
          montantTotal,
          statut: statut || "en_attente",
        },
        sessionOption
      );

      // 3. Traçabilité des stocks et enregistrement des lignes de vente
      const createdLines = [];
      for (const line of linesToCreate) {
        // Décrémenter le stock disponible sur l'article
        line.article.quantiteEnStock -= line.quantite;
        await line.article.save(sessionOption ? { session: sessionOption } : undefined);

        // TRAÇABILITÉ : Enregistrer le mouvement de stock (sortie)
        await MouvementStockRepository.createMouvement(
          {
            article_id: line.article_id,
            user_id: user_id || line.article.user_id,
            typeMouvement: "sortie",
            quantite: line.quantite,
            motif: `Vente N° ${invoiceNum}`,
            vente_id: newVente._id,
            dateMouvement: new Date(),
          },
          sessionOption
        );

        // Créer la ligne de vente correspondante
        const createdLine = await LigneVenteRepository.createLigneVente(
          {
            vente_id: newVente._id,
            article_id: line.article_id,
            quantite: line.quantite,
            prixUnitaire: line.prixUnitaire,
            sousTotal: line.sousTotal,
          },
          sessionOption
        );

        createdLines.push(createdLine);
      }

      // 4. Génération automatique de la facture liée à la vente
      const facture = await FactureService.createFactureFromVente(newVente._id, sessionOption);

      // 5. Validation de la transaction ACID
      if (isTransactionActive) {
        await session.commitTransaction();
      }

      const fullVente = await VenteRepository.getVenteById(newVente._id);
      return {
        vente: fullVente,
        facture,
        lignesVente: createdLines,
      };
    } catch (error) {
      // En cas d'échec : Rollback complet de toutes les opérations
      if (isTransactionActive) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      await session.endSession();
    }
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

  static getAllVentes = async () => {
    return await VenteRepository.getAllVentes();
  };

  static getVentesByClient = async (clientId) => {
    return await VenteRepository.getVentesByClient(clientId);
  };

  static getVentesByUser = async (userId) => {
    return await VenteRepository.getVentesByUser(userId);
  };

  static updateVente = async (id, update) => {
    return await VenteRepository.updateVente(id, update);
  };

  /**
   * Annulation / Suppression d'une vente :
   * Restaure le stock des articles, enregistre les mouvements 'entrée' et supprime la facture
   */
  static deleteVente = async (id, operatorUserId = null) => {
    const lignes = await LigneVenteRepository.getLignesByVenteId(id);

    // 1. Réintégrer le stock et tracer les mouvements d'entrée compensatoires
    for (const ligne of lignes) {
      const articleId = ligne.article_id?._id || ligne.article_id;
      const article = await ArticleRepository.getArticleById(articleId);
      if (article) {
        article.quantiteEnStock += ligne.quantite;
        await article.save();

        await MouvementStockRepository.createMouvement({
          article_id: article._id,
          user_id: operatorUserId || article.user_id,
          typeMouvement: "entrée",
          quantite: ligne.quantite,
          motif: `Annulation Vente ID ${id}`,
          vente_id: id,
          dateMouvement: new Date(),
        });
      }
    }

    // 2. Nettoyer la facture associée si elle existe
    const facture = await FactureRepository.getFactureByVenteId(id);
    if (facture) {
      await FactureRepository.deleteFacture(facture._id);
    }

    // 3. Supprimer les lignes et la vente
    await LigneVenteRepository.deleteLignesByVenteId(id);
    return await VenteRepository.deleteVente(id);
  };

  static deleteVenteById = async (id, operatorUserId = null) => {
    return await this.deleteVente(id, operatorUserId);
  };
}

export default VenteService;
