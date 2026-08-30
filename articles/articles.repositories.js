import articleModel from "./models/articles.models.js";

class ArticleRepository {
  static createArticle = async (data) => {
    return await articleModel.create(data);
  };

  static getArticleById = async (id) => {
    return await articleModel.findById(id).populate('fournisseur_id').populate('categorie_id');
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

  static updateArticle = async (id, update) => {
    return await articleModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).populate('fournisseur_id').populate('categorie_id');
  };

  static deleteArticle = async (id) => {
    return await articleModel.findByIdAndDelete(id);
  };
}

export default ArticleRepository;

