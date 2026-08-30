import express from "express";
import ArticleController from "./articles.controller.js";

const router = express.Router();

// Routes spécifiques (doivent précéder /:id)
router.get("/all", ArticleController.getAllArticles);
router.get("/alerte", ArticleController.getArticlesEnAlerte);
router.get("/fournisseur/:fournisseurId", ArticleController.getArticlesByFournisseur);
router.get("/categorie/:categorieId", ArticleController.getArticlesByCategorie);

// Création d'un article
router.post("/", ArticleController.createArticle);

// Routes dynamiques par ID
router.get("/:id", ArticleController.getArticleById);
router.put("/:id", ArticleController.updateArticle);
router.delete("/:id", ArticleController.deleteArticle);

export default router;
