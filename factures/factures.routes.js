import express from "express";
import FactureController from "./factures.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";
import validate from "../common/validator/validator.js";
import { genererFactureSchema, payerFactureSchema } from "./factures.validator.js";

const router = express.Router();

/**
 * @swagger
 * /factures/all:
 *   get:
 *     summary: Liste de toutes les factures
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des factures
 */
router.get("/all", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), FactureController.getAllFactures);

/**
 * @swagger
 * /factures/vente/{venteId}:
 *   get:
 *     summary: Récupérer la facture d'une vente
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: venteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Facture trouvée
 */
router.get("/vente/:venteId", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), FactureController.getFactureByVenteId);

/**
 * @swagger
 * /factures/client/{clientId}:
 *   get:
 *     summary: Factures d'un client
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Factures du client
 */
router.get("/client/:clientId", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), FactureController.getFacturesByClient);

/**
 * @swagger
 * /factures/{id}:
 *   get:
 *     summary: Détails d'une facture par son ID
 *     tags: [Factures]
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
 *         description: Détails de la facture
 */
router.get("/:id", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), FactureController.getFactureById);

/**
 * @swagger
 * /factures/generer:
 *   post:
 *     summary: Générer une facture pour une vente existante
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [venteId]
 *             properties:
 *               venteId: { type: string, example: "" }
 *     responses:
 *       201:
 *         description: Facture générée
 */
router.post(
  "/generer",
  verifyAccessToken,
  authorize('admin', 'gestionnaire', 'caissier'),
  validate(genererFactureSchema),
  FactureController.createFactureFromVente
);

/**
 * @swagger
 * /factures/{id}/payer:
 *   post:
 *     summary: "Enregistrer un paiement direct sur une facture (Action atomique Finances)"
 *     description: "Crée le paiement, réconcilie le solde de la facture et insère directement une recette dans Finances de manière atomique."
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [montant, modePaiement]
 *             properties:
 *               montant: { type: number, example: 0 }
 *               modePaiement: { type: string, enum: [espèces, carte, chèque, virement, mobile_money, autre], example: "espèces" }
 *               description: { type: string, example: "" }
 *     responses:
 *       200:
 *         description: Paiement enregistré avec succès et synchronisé dans Finances
 */
router.post(
  "/:id/payer",
  verifyAccessToken,
  authorize('admin', 'gestionnaire', 'caissier'),
  validate(payerFactureSchema),
  FactureController.payerFacture
);

/**
 * @swagger
 * /factures/{id}:
 *   delete:
 *     summary: Supprimer une facture (Admin uniquement, refusé si paiements existants)
 *     tags: [Factures]
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
 *         description: Facture supprimée
 */
router.delete("/:id", verifyAccessToken, authorize('admin'), FactureController.deleteFacture);

export default router;
