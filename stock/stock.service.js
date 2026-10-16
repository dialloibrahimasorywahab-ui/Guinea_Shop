import ArticleRepository from "../articles/articles.repositories.js";
import MouvementStockService from "../Mouvement_stock/mouvement_stock.service.js";

class StockService {
  /**
   * Consultation de l'état actuel des stocks de tous les articles avec valorisation
   */
  static getEtatStock = async () => {
    const articles = await ArticleRepository.getAllArticles();

    let quantiteTotale = 0;
    let valeurTotale = 0;
    let nbArticlesEnAlerte = 0;

    const stockDetails = articles.map((art) => {
      const qte = art.quantiteEnStock || 0;
      const pu = art.prixUnitaire || 0;
      const seuil = art.seuilAlerte || 5;
      const valeur = qte * pu;
      const enAlerte = qte <= seuil;

      quantiteTotale += qte;
      valeurTotale += valeur;
      if (enAlerte) nbArticlesEnAlerte += 1;

      return {
        article_id: art._id,
        libelle: art.libelle,
        categorie: art.categorie_id?.nom || 'Sans catégorie',
        fournisseur: art.fournisseur_id?.nom || 'Sans fournisseur',
        quantiteEnStock: qte,
        seuilAlerte: seuil,
        prixUnitaire: pu,
        valeurStock: valeur,
        statut: enAlerte ? 'alerte' : 'normal',
      };
    });

    return {
      nbArticles: articles.length,
      nbArticlesEnAlerte,
      quantiteTotale,
      valeurTotale,
      articles: stockDetails,
    };
  };

  /**
   * Récupération des articles sous le seuil d'alerte (besoin de réapprovisionnement)
   */
  static getArticlesEnAlerte = async () => {
    const articles = await ArticleRepository.getArticlesEnAlerte();
    return articles.map((art) => ({
      article_id: art._id,
      libelle: art.libelle,
      quantiteEnStock: art.quantiteEnStock,
      seuilAlerte: art.seuilAlerte,
      fournisseur: art.fournisseur_id?.nom || 'Non défini',
      prixUnitaire: art.prixUnitaire,
    }));
  };

  /**
   * Niveau de stock d'un article spécifique
   */
  static getStockByArticleId = async (articleId) => {
    const article = await ArticleRepository.getArticleById(articleId);
    if (!article) {
      throw new Error(`Article ID ${articleId} introuvable`);
    }

    const qte = article.quantiteEnStock || 0;
    const seuil = article.seuilAlerte || 5;

    return {
      article_id: article._id,
      libelle: article.libelle,
      quantiteEnStock: qte,
      seuilAlerte: seuil,
      prixUnitaire: article.prixUnitaire,
      valeurStock: qte * (article.prixUnitaire || 0),
      statut: qte <= seuil ? 'alerte' : 'normal',
    };
  };

  /**
   * Ajustement manuel de stock (ex: inventaire physique annuel ou correction de stock)
   * Déclenche de façon atomique un mouvement dans Mouvement_stock avec type 'ajustement'
   */
  static ajusterStock = async (data) => {
    const { article_id, nouvelleQuantite, motif, user_id } = data;

    return await MouvementStockService.createMouvement({
      article_id,
      user_id,
      typeMouvement: 'ajustement',
      quantite: Number(nouvelleQuantite),
      motif: motif || 'Ajustement manuel inventaire',
    });
  };
}

export default StockService;
