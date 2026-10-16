import articleModel from "./models/articles.models.js";

class ArticleRepository {
  static createArticle = async (data, session = null) => {
    const article = new articleModel(data);
    return await article.save(session ? { session } : undefined);
  };

  static getArticleById = async (id, session = null) => {
    const query = articleModel.findById(id).populate('fournisseur_id').populate('categorie_id');
    if (session) query.session(session);
    return await query;
  };

  static getAllArticles = async () => {
    return await articleModel.find().populate('fournisseur_id').populate('categorie_id');
  };

  static getArticlesByFournisseur = async (fournisseurId) => {
    return await articleModel.find({ fournisseur_id: fournisseurId }).populate('fournisseur_id').populate('categorie_id');
  };

  static getArticlesByCategorie = async (categorieId) => {
    return await articleModel.find({ categorie_id: categorieId }).populate('fournisseur_id').populate('categorie_id');
  };

  static getArticlesEnAlerte = async () => {
    return await articleModel.find({
      $expr: { $lte: ['$quantiteEnStock', '$seuilAlerte'] },
    }).populate('fournisseur_id').populate('categorie_id');
  };

  static updateArticle = async (id, update, session = null) => {
    return await articleModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
      ...(session ? { session } : {}),
    }).populate('fournisseur_id').populate('categorie_id');
  };

  static deleteArticle = async (id, session = null) => {
    return await articleModel.findByIdAndDelete(id, session ? { session } : undefined);
  };
}

export default ArticleRepository;
