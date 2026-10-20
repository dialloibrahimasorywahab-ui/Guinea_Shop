import MouvementStockRepository from "./mouvement_stock.repositories.js";
import ArticleRepository from "../articles/articles.repositories.js";
import runInTransaction from "../common/db/transaction.js";

class MouvementStockService {
  /**
   * Enregistrement d'un mouvement de stock manuel ou automatique avec mise à jour du stock réel
   */
  static createMouvement = async (data, externalSession = null) => {
    const execute = async (session) => {
      const { article_id, user_id, typeMouvement, quantite, motif, achat_id, vente_id } = data;

      const article = await ArticleRepository.getArticleById(article_id, session);
      if (!article) {
        throw new Error(`Article ID ${article_id} introuvable`);
      }

      const quantiteAvant = article.quantiteEnStock;
      let quantiteApres = quantiteAvant;
      let mouvementQuantite = Number(quantite);

      if (typeMouvement === 'entrée') {
        quantiteApres = quantiteAvant + Number(quantite);
        await ArticleRepository.incrementStock(article_id, Number(quantite), session);
      } else if (typeMouvement === 'sortie') {
        if (quantiteAvant < Number(quantite)) {
          throw new Error(
            `Stock insuffisant pour l'article "${article.libelle}". Disponible: ${quantiteAvant}, Demandé: ${quantite}`
          );
        }
        const updated = await ArticleRepository.decrementStock(article_id, Number(quantite), session);
        if (!updated) {
          throw new Error(`Stock insuffisant ou article inactif : "${article.libelle}"`);
        }
        quantiteApres = quantiteAvant - Number(quantite);
      } else if (typeMouvement === 'ajustement') {
        quantiteApres = Number(quantite);
        const ecart = quantiteApres - quantiteAvant;
        if (ecart === 0) {
          throw new Error("Aucun changement de stock : la nouvelle quantité est identique au stock actuel");
        }
        mouvementQuantite = Math.abs(ecart);
        await ArticleRepository.updateArticle(
          article_id,
          { quantiteEnStock: quantiteApres },
          session
        );
      } else {
        throw new Error("Type de mouvement invalide. Utilisez: 'entrée', 'sortie' ou 'ajustement'");
      }

      const mouvement = await MouvementStockRepository.createMouvement(
        {
          article_id,
          user_id,
          typeMouvement,
          quantite: mouvementQuantite,
          quantiteAvant,
          quantiteApres,
          motif: motif || '',
          achat_id: achat_id || null,
          vente_id: vente_id || null,
        },
        session
      );

      return await MouvementStockRepository.getMouvementById(mouvement._id, session);
    };

    if (externalSession) {
      return await execute(externalSession);
    }
    return await runInTransaction(execute);
  };

  static getMouvementById = async (id) => {
    return await MouvementStockRepository.getMouvementById(id);
  };

  static getAllMouvements = async (filter = {}) => {
    return await MouvementStockRepository.getAllMouvements(filter);
  };

  static getMouvementsByArticle = async (articleId) => {
    return await MouvementStockRepository.getMouvementsByArticle(articleId);
  };

  static getMouvementsByType = async (typeMouvement) => {
    return await MouvementStockRepository.getMouvementsByType(typeMouvement);
  };

  static deleteMouvement = async (id) => {
    return await MouvementStockRepository.deleteMouvement(id);
  };
}

export default MouvementStockService;
