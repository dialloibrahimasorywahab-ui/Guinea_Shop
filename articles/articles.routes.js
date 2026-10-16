import express from "express";
import ArticleController from "./articles.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";

const router = express.Router();

// Consultation : accessible à tout utilisateur authentifié
router.get("/all", verifyAccessToken, ArticleController.getAllArticles);
router.get("/alerte", verifyAccessToken, authorize('admin', 'gestionnaire'), ArticleController.getArticlesEnAlerte);
router.get("/fournisseur/:fournisseurId", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), ArticleController.getArticlesByFournisseur);
router.get("/categorie/:categorieId", verifyAccessToken, ArticleController.getArticlesByCategorie);
router.get("/:id", verifyAccessToken, ArticleController.getArticleById);

// Création & modification : admin et gestionnaire
router.post("/", verifyAccessToken, authorize('admin', 'gestionnaire'), ArticleController.createArticle);
router.put("/:id", verifyAccessToken, authorize('admin', 'gestionnaire'), ArticleController.updateArticle);

// Suppression : réservée à l'admin
router.delete("/:id", verifyAccessToken, authorize('admin'), ArticleController.deleteArticle);

export default router;
