import VenteRepository from "./ventes.repositories.js";
import LigneVenteRepository from "../ligne_ventes/ligne_ventes.repositories.js";
import ArticleRepository from "../articles/articles.repositories.js";
import FactureService from "../factures/factures.service.js";

class VenteService {
  static createVente = async (data) => {
    const { client_id, user_id, items, numeroFacture, statut } = data;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Une vente doit contenir au moins un article");
    }

    const invoiceNum = numeroFacture || `FAC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let montantTotal = 0;
    const linesToCreate = [];

    // Verifier le stock et calculer les sous-totaux
    for (const item of items) {
      const article = await ArticleRepository.getArticleById(item.article_id);
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

    // Créer l'entête de la vente
    const newVente = await VenteRepository.createVente({
      client_id,
      user_id,
      numeroFacture: invoiceNum,
      montantTotal,
      statut: statut || 'en_attente',
    });

    // Mettre à jour les stocks et créer les lignes de vente
    const createdLines = [];
    for (const line of linesToCreate) {
      // Mettre à jour la quantité en stock de l'article
      line.article.quantiteEnStock -= line.quantite;
      await line.article.save();

      // Créer la ligne de vente
      const createdLine = await LigneVenteRepository.createLigneVente({
        vente_id: newVente._id,
        article_id: line.article_id,
        quantite: line.quantite,
        prixUnitaire: line.prixUnitaire,
        sousTotal: line.sousTotal,
      });

      createdLines.push(createdLine);
    }

    // Générer automatiquement la facture liée à la vente
    const facture = await FactureService.createFactureFromVente(newVente._id);

    const fullVente = await VenteRepository.getVenteById(newVente._id);
    return {
      vente: fullVente,
      facture,
      lignesVente: createdLines,
    };
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

  static deleteVente = async (id) => {
    await LigneVenteRepository.deleteLignesByVenteId(id);
    return await VenteRepository.deleteVente(id);
  };

  static deleteVenteById = async (id) => {
    return await this.deleteVente(id);
  };
}

export default VenteService;
