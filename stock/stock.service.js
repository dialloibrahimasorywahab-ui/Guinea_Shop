import StockRepository from "./stock.repositories.js";
import ArticleRepository from "../articles/articles.repositories.js";

class StockService {
  static createStockMouvement = async (data) => {
    const { article_id, user_id, typeMouvement, quantite } = data;

    const article = await ArticleRepository.getArticleById(article_id);
    if (!article) {
      throw new Error(`Article ID ${article_id} introuvable`);
    }

    if (typeMouvement === 'entrée') {
      article.quantiteEnStock += quantite;
    } else if (typeMouvement === 'sortie') {
      if (article.quantiteEnStock < quantite) {
        throw new Error(
          `Stock insuffisant pour l'article "${article.libelle}". Disponible: ${article.quantiteEnStock}, Demandé: ${quantite}`
        );
      }
      article.quantiteEnStock -= quantite;
    } else if (typeMouvement === 'ajustement') {
      article.quantiteEnStock = quantite;
    } else {
      throw new Error("Type de mouvement invalide. Utilisez: 'entrée', 'sortie' ou 'ajustement'");
    }

    await article.save();

    const mouvement = await StockRepository.createStockMouvement({
      article_id,
      user_id,
      typeMouvement,
      quantite,
    });

    return await StockRepository.getStockById(mouvement._id);
  };

  static getStockById = async (id) => {
    return await StockRepository.getStockById(id);
  };

  static getAllStockMouvements = async () => {
    return await StockRepository.getAllStockMouvements();
  };

  static getMouvementsByArticle = async (articleId) => {
    return await StockRepository.getMouvementsByArticle(articleId);
  };

  static getMouvementsByType = async (typeMouvement) => {
    return await StockRepository.getMouvementsByType(typeMouvement);
  };

  static deleteStockMouvement = async (id) => {
    return await StockRepository.deleteStockMouvement(id);
  };

  static deleteStockMouvementById = async (id) => {
    return await StockRepository.deleteStockMouvement(id);
  };
}

export default StockService;
