import express from "express";
import StockController from "./stock.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";
import validate from "../common/validator/validator.js";
import { ajusterStockSchema } from "./stock.validator.js";

const router = express.Router();

/**
 * @swagger
 * /stock/etat:
 *   get:
 *     summary: Synthèse et valorisation globale du stock
 *     tags: [Stock & Mouvements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: État et valeur financière totale du stock
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalArticles: { type: number, example: 42 }
 *                     valeurTotaleStock: { type: number, example: 125000000 }
 *                     articlesEnAlerte: { type: number, example: 3 }
 *                     articlesRupture: { type: number, example: 1 }
 */
router.get("/", verifyAccessToken, authorize('admin', 'gestionnaire'), StockController.getEtatStock);
router.get("/etat", verifyAccessToken, authorize('admin', 'gestionnaire'), StockController.getEtatStock);

/**
 * @swagger
 * /stock/alertes:
 *   get:
 *     summary: Liste des articles en dessous du seuil d'alerte de réapprovisionnement
 *     tags: [Stock & Mouvements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des articles nécessitant réapprovisionnement
 */
router.get("/alertes", verifyAccessToken, authorize('admin', 'gestionnaire'), StockController.getArticlesEnAlerte);

/**
 * @swagger
 * /stock/article/{articleId}:
 *   get:
 *     summary: Niveau de stock et statut d'un article spécifique
 *     tags: [Stock & Mouvements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Informations du stock de l'article
 */
router.get("/article/:articleId", verifyAccessToken, authorize('admin', 'gestionnaire'), StockController.getStockByArticleId);

/**
 * @swagger
 * /stock/ajustement:
 *   post:
 *     summary: Ajustement d'inventaire physique (avec traçabilité dans MouvementStock)
 *     tags: [Stock & Mouvements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [article_id, nouvelleQuantite, motif]
 *             properties:
 *               article_id: { type: string, example: "66f0123456789abcdef01235" }
 *               nouvelleQuantite: { type: number, example: 20 }
 *               motif: { type: string, example: "Inventaire physique semestriel" }
 *     responses:
 *       200:
 *         description: Stock ajusté et mouvement consigné
 */
router.post(
  "/ajustement",
  verifyAccessToken,
  authorize('admin', 'gestionnaire'),
  validate(ajusterStockSchema),
  StockController.ajusterStock
);

export default router;
