import articleModel from "./models/articles.models.js";
import "../fournisseur/models/fournisseur.models.js";
import "../categories/models/categories.models.js";
import applyApiFeatures from "../common/utils/apiFeatures.js";

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

  static getAllArticles = async (queryParams = {}) => {
    const query = articleModel.find().populate('fournisseur_id').populate('categorie_id');
    return await applyApiFeatures(query, queryParams, {
      searchFields: ['libelle', 'description', 'marque', 'couleur', 'taille'],
      filterFields: ['categorie_id', 'fournisseur_id', 'marque', 'couleur', 'taille', 'libelle'],
      allowedSortFields: ['libelle', 'prixUnitaire', 'quantiteEnStock', 'seuilAlerte', 'createdAt'],
      defaultSort: { createdAt: -1 },
      aliases: { nom: 'libelle', search: 'q' },
    });
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

  /**
   * Décrémentation atomique de stock sous condition de disponibilité et article actif
   */
  static decrementStock = async (id, quantite, session = null) => {
    return await articleModel.findOneAndUpdate(
      { _id: id, isActive: true, quantiteEnStock: { $gte: quantite } },
      { $inc: { quantiteEnStock: -quantite } },
      { new: true, runValidators: true, ...(session ? { session } : {}) }
    );
  };

  /**
   * Incrémentation atomique de stock
   */
  static incrementStock = async (id, quantite, session = null) => {
    return await articleModel.findByIdAndUpdate(
      id,
      { $inc: { quantiteEnStock: quantite } },
      { new: true, runValidators: true, ...(session ? { session } : {}) }
    );
  };
}

export default ArticleRepository;
