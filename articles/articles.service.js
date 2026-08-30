import ArticleRepository from "./articles.repositories.js";

class ArticleService {
  static createArticle = async (data) => {
    return await ArticleRepository.createArticle(data);
  };

  static getArticleById = async (id) => {
    return await ArticleRepository.getArticleById(id);
  };

  static getAllArticles = async () => {
    return await ArticleRepository.getAllArticles();
  };

  static getArticlesByFournisseur = async (fournisseurId) => {
    return await ArticleRepository.getArticlesByFournisseur(fournisseurId);
  };

  static getArticlesByCategorie = async (categorieId) => {
    return await ArticleRepository.getArticlesByCategorie(categorieId);
  };

  static getArticlesEnAlerte = async () => {
    return await ArticleRepository.getArticlesEnAlerte();
  };

  static updateArticle = async (id, update) => {
    return await ArticleRepository.updateArticle(id, update);
  };

  static deleteArticle = async (id) => {
    return await ArticleRepository.deleteArticle(id);
  };

  static deleteArticleById = async (id) => {
    return await ArticleRepository.deleteArticle(id);
  };
}

export default ArticleService;
