import express from "express";
import ArticleController from "./articles.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";

const router = express.Router();

/**
 * @swagger
 * /articles/all:
 *   get:
 *     summary: Récupérer tous les articles
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des articles
 */
router.get("/all", verifyAccessToken, ArticleController.getAllArticles);

/**
 * @swagger
 * /articles/alerte:
 *   get:
 *     summary: Articles en dessous du seuil d'alerte
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des articles en alerte
 */
router.get("/alerte", verifyAccessToken, authorize('admin', 'gestionnaire'), ArticleController.getArticlesEnAlerte);

/**
 * @swagger
 * /articles/fournisseur/{fournisseurId}:
 *   get:
 *     summary: Articles d'un fournisseur
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fournisseurId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Articles du fournisseur
 */
router.get("/fournisseur/:fournisseurId", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), ArticleController.getArticlesByFournisseur);

/**
 * @swagger
 * /articles/categorie/{categorieId}:
 *   get:
 *     summary: Articles d'une catégorie
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categorieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Articles de la catégorie
 */
router.get("/categorie/:categorieId", verifyAccessToken, ArticleController.getArticlesByCategorie);

/**
 * @swagger
 * /articles/{id}:
 *   get:
 *     summary: Détails d'un article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'article
 *   put:
 *     summary: Modifier un article (Admin et Gestionnaire)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article mis à jour
 *   delete:
 *     summary: Supprimer un article (Admin uniquement)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article supprimé
 */
router.get("/:id", verifyAccessToken, ArticleController.getArticleById);

/**
 * @swagger
 * /articles:
 *   post:
 *     summary: Créer un nouvel article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [libelle, prixUnitaire, categorie_id]
 *             properties:
 *               libelle: { type: string, example: "Imprimante Laser HP" }
 *               prixUnitaire: { type: number, example: 1800000 }
 *               quantiteEnStock: { type: number, example: 10 }
 *               seuilAlerte: { type: number, example: 2 }
 *               categorie_id: { type: string, example: "66f0123456789abcdef01236" }
 *     responses:
 *       201:
 *         description: Article créé avec succès
 */
router.post("/", verifyAccessToken, authorize('admin', 'gestionnaire'), ArticleController.createArticle);
router.put("/:id", verifyAccessToken, authorize('admin', 'gestionnaire'), ArticleController.updateArticle);
router.delete("/:id", verifyAccessToken, authorize('admin'), ArticleController.deleteArticle);

export default router;
