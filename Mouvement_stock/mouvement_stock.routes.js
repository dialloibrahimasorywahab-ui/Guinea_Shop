import express from "express";
import MouvementStockController from "./mouvement_stock.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";
import validate from "../common/validator/validator.js";
import { createMouvementStockSchema } from "./mouvement_stock.validator.js";

const router = express.Router();

/**
 * @swagger
 * /mouvements-stock/all:
 *   get:
 *     summary: Journal d'audit complet de tous les mouvements de stock
 *     tags: [Stock & Mouvements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de tous les mouvements de stock
 */
router.get("/all", verifyAccessToken, authorize('admin', 'gestionnaire'), MouvementStockController.getAllMouvements);

/**
 * @swagger
 * /mouvements-stock/article/{articleId}:
 *   get:
 *     summary: Historique des flux de stock pour un article donné
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
 *         description: Liste des mouvements pour cet article
 */
router.get("/article/:articleId", verifyAccessToken, authorize('admin', 'gestionnaire'), MouvementStockController.getMouvementsByArticle);

/**
 * @swagger
 * /mouvements-stock/type/{type}:
 *   get:
 *     summary: Filtrer les mouvements par type (entrée, sortie, ajustement)
 *     tags: [Stock & Mouvements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [entrée, sortie, ajustement]
 *     responses:
 *       200:
 *         description: Liste filtrée
 */
router.get("/type/:type", verifyAccessToken, authorize('admin', 'gestionnaire'), MouvementStockController.getMouvementsByType);

/**
 * @swagger
 * /mouvements-stock/{id}:
 *   get:
 *     summary: Détails d'un mouvement de stock
 *     tags: [Stock & Mouvements]
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
 *         description: Informations du mouvement
 */
router.get("/:id", verifyAccessToken, authorize('admin', 'gestionnaire'), MouvementStockController.getMouvementById);

/**
 * @swagger
 * /mouvements-stock:
 *   post:
 *     summary: Enregistrer manuellement un mouvement de stock
 *     tags: [Stock & Mouvements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [article_id, typeMouvement, quantite, motif]
 *             properties:
 *               article_id: { type: string, example: "66f0123456789abcdef01235" }
 *               typeMouvement: { type: string, enum: [entrée, sortie, ajustement], example: "entrée" }
 *               quantite: { type: number, example: 5 }
 *               motif: { type: string, example: "Retour client SAV" }
 *     responses:
 *       201:
 *         description: Mouvement enregistré
 */
router.post(
  "/",
  verifyAccessToken,
  authorize('admin', 'gestionnaire'),
  validate(createMouvementStockSchema),
  MouvementStockController.createMouvement
);

/**
 * @swagger
 * /mouvements-stock/{id}:
 *   delete:
 *     summary: Supprimer un mouvement de stock (Admin uniquement)
 *     tags: [Stock & Mouvements]
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
 *         description: Mouvement supprimé
 */
router.delete("/:id", verifyAccessToken, authorize('admin'), MouvementStockController.deleteMouvement);

export default router;
