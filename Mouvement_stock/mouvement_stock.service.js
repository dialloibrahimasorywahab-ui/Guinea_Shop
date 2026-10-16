import MouvementStockRepository from "./mouvement_stock.repositories.js";
import ArticleRepository from "../articles/articles.repositories.js";

class MouvementStockService {
  /**
   * Enregistrement d'un mouvement de stock manuel ou automatique avec mise à jour du stock réel
   */
  static createMouvement = async (data, session = null) => {
    const { article_id, user_id, typeMouvement, quantite, motif, achat_id, vente_id } = data;

    const article = await ArticleRepository.getArticleById(article_id, session);
    if (!article) {
      throw new Error(`Article ID ${article_id} introuvable`);
    }

    if (typeMouvement === 'entrée') {
      article.quantiteEnStock += Number(quantite);
    } else if (typeMouvement === 'sortie') {
      if (article.quantiteEnStock < quantite) {
        throw new Error(
          `Stock insuffisant pour l'article "${article.libelle}". Disponible: ${article.quantiteEnStock}, Demandé: ${quantite}`
        );
      }
      article.quantiteEnStock -= Number(quantite);
    } else if (typeMouvement === 'ajustement') {
      article.quantiteEnStock = Number(quantite);
    } else {
      throw new Error("Type de mouvement invalide. Utilisez: 'entrée', 'sortie' ou 'ajustement'");
    }

    await article.save(session ? { session } : undefined);

    const mouvement = await MouvementStockRepository.createMouvement(
      {
        article_id,
        user_id,
        typeMouvement,
        quantite: Number(quantite),
        motif: motif || '',
        achat_id: achat_id || null,
        vente_id: vente_id || null,
      },
      session
    );

    return await MouvementStockRepository.getMouvementById(mouvement._id, session);
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
