import express from "express";
import FinanceController from "./finances.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";
import validate from "../common/validator/validator.js";
import { createFinanceSchema } from "./finances.validator.js";

const router = express.Router();

/**
 * @swagger
 * /finances/bilan:
 *   get:
 *     summary: Bilan financier consolidé (Recettes, Dépenses et Solde Net)
 *     tags: [Finances]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bilan financier consolidé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRecettes: { type: number, example: 15000000 }
 *                     totalDepenses: { type: number, example: 8000000 }
 *                     soldeNet: { type: number, example: 7000000 }
 *                     nbRecettes: { type: number, example: 25 }
 *                     nbDepenses: { type: number, example: 10 }
 *                     nbTransactions: { type: number, example: 35 }
 */
router.get("/bilan", verifyAccessToken, authorize('admin', 'gestionnaire'), FinanceController.getBilanFinancier);

/**
 * @swagger
 * /finances/all:
 *   get:
 *     summary: Journal des transactions financières (recettes et dépenses)
 *     tags: [Finances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [recette, dépense]
 *         description: Filtrer par type de flux
 *       - in: query
 *         name: categorie
 *         schema:
 *           type: string
 *           enum: [vente, achat, salaire, loyer, charge, autre]
 *         description: Filtrer par catégorie
 *     responses:
 *       200:
 *         description: Liste des transactions financières
 */
router.get("/all", verifyAccessToken, authorize('admin', 'gestionnaire'), FinanceController.getAllTransactions);

/**
 * @swagger
 * /finances/{id}:
 *   get:
 *     summary: Détails d'une transaction financière
 *     tags: [Finances]
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
 *         description: Détails de la transaction
 */
router.get("/:id", verifyAccessToken, authorize('admin', 'gestionnaire'), FinanceController.getTransactionById);

/**
 * @swagger
 * /finances:
 *   post:
 *     summary: Enregistrer manuellement une transaction financière (charge, loyer, recette diverse)
 *     tags: [Finances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, categorie, montant]
 *             properties:
 *               type: { type: string, enum: [recette, dépense], example: "dépense" }
 *               categorie: { type: string, enum: [vente, achat, salaire, loyer, charge, autre], example: "loyer" }
 *               montant: { type: number, example: 2500000 }
 *               modePaiement: { type: string, example: "virement" }
 *               description: { type: string, example: "Loyer du local commercial - Mois en cours" }
 *     responses:
 *       201:
 *         description: Transaction enregistrée avec succès
 */
router.post(
  "/",
  verifyAccessToken,
  authorize('admin', 'gestionnaire'),
  validate(createFinanceSchema),
  FinanceController.createTransaction
);

/**
 * @swagger
 * /finances/{id}:
 *   delete:
 *     summary: Supprimer une écriture financière (Admin uniquement)
 *     tags: [Finances]
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
 *         description: Écriture financière supprimée
 */
router.delete("/:id", verifyAccessToken, authorize('admin'), FinanceController.deleteTransaction);

export default router;
