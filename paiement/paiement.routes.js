import express from "express";
import PaiementController from "./paiement.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";
import validate from "../common/validator/validator.js";
import { createPaiementSchema, updatePaiementSchema } from "./paiement.validator.js";

const router = express.Router();

/**
 * @swagger
 * /paiements/all:
 *   get:
 *     summary: Récupérer tous les paiements
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: modePaiement
 *         schema:
 *           type: string
 *           enum: [espèces, orange_money, mtn_momo, virement, carte_bancaire, chèque]
 *         description: "Filtrer par mode de paiement"
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [validé, en_attente, échoué, annulé]
 *         description: "Filtrer par statut de paiement"
 *       - in: query
 *         name: vente_id
 *         schema:
 *           type: string
 *         description: "Filtrer par ID de vente"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: "Recherche par numéro de transaction, référence ou description"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [datePaiement, montant, statut, createdAt]
 *           default: datePaiement
 *         description: "Champ de tri"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: "Ordre de tri : ascendant (asc) ou descendant (desc)"
 *     responses:
 *       200:
 *         description: Liste de tous les règlements
 */
router.get("/all", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), PaiementController.getAllPaiements);

/**
 * @swagger
 * /paiements/vente/{venteId}:
 *   get:
 *     summary: Lister les paiements d'une vente donnée
 *     tags: [Paiements]
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
 *         description: Historique des paiements de la vente
 */
router.get("/vente/:venteId", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), PaiementController.getPaiementsByVente);

/**
 * @swagger
 * /paiements/mode/{mode}:
 *   get:
 *     summary: Filtrer les paiements par mode
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mode
 *         required: true
 *         schema:
 *           type: string
 *           enum: [espèces, espèce, carte, chèque, virement, mobile_money, autre]
 *     responses:
 *       200:
 *         description: Liste des paiements correspondants
 */
router.get("/mode/:mode", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), PaiementController.getPaiementsByMode);

/**
 * @swagger
 * /paiements/{id}:
 *   get:
 *     summary: Détails d'un paiement
 *     tags: [Paiements]
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
 *         description: Informations du paiement
 */
router.get("/:id", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), PaiementController.getPaiementById);

/**
 * @swagger
 * /paiements:
 *   post:
 *     summary: "Enregistrer un paiement (Génère directement et atomiquement une écriture dans Finances)"
 *     description: "Enregistre le paiement, met à jour le solde de la vente, synchronise la facture et insère une recette dans Finances de façon 100% ACID."
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [montant, modePaiement]
 *             properties:
 *               vente_id: { type: string, example: "" }
 *               facture_id: { type: string, example: "" }
 *               montant: { type: number, example: 0 }
 *               modePaiement: { type: string, enum: [espèces, carte, chèque, virement, mobile_money, autre], example: "espèces" }
 *               statut: { type: string, enum: [validé, en_attente], example: "validé" }
 *               description: { type: string, example: "" }
 *     responses:
 *       201:
 *         description: Paiement enregistré et synchronisé avec Factures et Finances
 */
router.post(
  "/",
  verifyAccessToken,
  authorize('admin', 'gestionnaire', 'caissier'),
  validate(createPaiementSchema),
  PaiementController.createPaiement
);

/**
 * @swagger
 * /paiements/{id}:
 *   put:
 *     summary: Mettre à jour un paiement
 *     tags: [Paiements]
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
 *         description: Paiement mis à jour
 *   delete:
 *     summary: Annuler / Supprimer un paiement (Rollback atomique Facture & Finances)
 *     tags: [Paiements]
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
 *         description: Paiement supprimé et trésorerie réajustée
 */
router.put(
  "/:id",
  verifyAccessToken,
  authorize('admin', 'gestionnaire'),
  validate(updatePaiementSchema),
  PaiementController.updatePaiement
);
router.delete("/:id", verifyAccessToken, authorize('admin'), PaiementController.deletePaiement);

export default router;
