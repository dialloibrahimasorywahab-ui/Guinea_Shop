import ArticleService from "./articles.service.js";

class ArticleController {
  static createArticle = async (req, res) => {
    try {
      const newArticle = await ArticleService.createArticle(req.body);
      return res.status(201).json({
        success: true,
        data: newArticle,
        message: "Article créé avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getAllArticles = async (req, res) => {
    try {
      const articles = await ArticleService.getAllArticles();
      return res.status(200).json({ success: true, data: articles });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  static getArticleById = async (req, res) => {
    try {
      const article = await ArticleService.getArticleById(req.params.id);
      if (!article) {
        return res.status(404).json({ success: false, error: "Article introuvable" });
      }
      return res.status(200).json({ success: true, data: article });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getArticlesByFournisseur = async (req, res) => {
    try {
      const { fournisseurId } = req.params;
      const articles = await ArticleService.getArticlesByFournisseur(fournisseurId);
      return res.status(200).json({ success: true, data: articles });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getArticlesByCategorie = async (req, res) => {
    try {
      const { categorieId } = req.params;
      const articles = await ArticleService.getArticlesByCategorie(categorieId);
      return res.status(200).json({ success: true, data: articles });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getArticlesEnAlerte = async (req, res) => {
    try {
      const articles = await ArticleService.getArticlesEnAlerte();
      return res.status(200).json({ success: true, data: articles });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  static updateArticle = async (req, res) => {
    try {
      const updatedArticle = await ArticleService.updateArticle(req.params.id, req.body);
      if (!updatedArticle) {
        return res.status(404).json({ success: false, error: "Article introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: updatedArticle,
        message: "Article mis à jour avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static deleteArticle = async (req, res) => {
    try {
      const deletedArticle = await ArticleService.deleteArticleById(req.params.id);
      if (!deletedArticle) {
        return res.status(404).json({ success: false, error: "Article introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: deletedArticle,
        message: "Article supprimé avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };
}

export default ArticleController;
