import express from "express";
import AchatController from "./achats.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";
import validate from "../common/validator/validator.js";
import { createAchatSchema, updateAchatSchema } from "./achats.validator.js";

const router = express.Router();

/**
 * @swagger
 * /achats/all:
 *   get:
 *     summary: Récupérer tous les achats fournisseurs
 *     tags: [Achats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [en_attente, reçu, annulé]
 *         description: "Filtrer par statut d'achat"
 *       - in: query
 *         name: fournisseur_id
 *         schema:
 *           type: string
 *         description: "Filtrer par ID fournisseur"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: "Recherche par numéro d'achat"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [dateAchat, montantTotal, statut, createdAt]
 *           default: createdAt
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
 *         description: Liste de tous les achats
 */
router.get("/all", verifyAccessToken, authorize('admin', 'gestionnaire'), AchatController.getAllAchats);

/**
 * @swagger
 * /achats/fournisseur/{fournisseurId}:
 *   get:
 *     summary: Liste des achats par fournisseur
 *     tags: [Achats]
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
 *         description: Historique des achats auprès du fournisseur
 */
router.get("/fournisseur/:fournisseurId", verifyAccessToken, authorize('admin', 'gestionnaire'), AchatController.getAchatsByFournisseur);

/**
 * @swagger
 * /achats/{id}:
 *   get:
 *     summary: Détails d'un achat et de ses lignes d'achat
 *     tags: [Achats]
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
 *         description: Informations détaillées de l'achat
 */
router.get("/:id", verifyAccessToken, authorize('admin', 'gestionnaire'), AchatController.getAchatById);

/**
 * @swagger
 * /achats:
 *   post:
 *     summary: "Enregistrer une commande / réception d'achat (Incrémente le stock et consigne une dépense Finances)"
 *     tags: [Achats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fournisseur_id, items]
 *             properties:
 *               fournisseur_id: { type: string, example: "66f0123456789abcdef01244" }
 *               numeroFactureFournisseur: { type: string, example: "FF-2026-001" }
 *               modePaiement: { type: string, enum: [espèces, carte, chèque, virement, mobile_money, autre], example: "virement" }
 *               statut: { type: string, enum: [commandé, reçu], example: "reçu" }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [article_id, quantite, prixAchat]
 *                   properties:
 *                     article_id: { type: string, example: "66f0123456789abcdef01235" }
 *                     quantite: { type: number, example: 10 }
 *                     prixAchat: { type: number, example: 3500000 }
 *     responses:
 *       201:
 *         description: Achat enregistré, stock incrémenté et flux financier consigné
 */
router.post(
  "/",
  verifyAccessToken,
  authorize('admin', 'gestionnaire'),
  validate(createAchatSchema),
  AchatController.createAchat
);

/**
 * @swagger
 * /achats/{id}:
 *   put:
 *     summary: Mettre à jour un achat
 *     tags: [Achats]
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
 *         description: Achat mis à jour
 *   delete:
 *     summary: Annuler / Supprimer un achat (Annule l'impact stock et finances)
 *     tags: [Achats]
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
 *         description: Achat supprimé
 */
router.put(
  "/:id",
  verifyAccessToken,
  authorize('admin', 'gestionnaire'),
  validate(updateAchatSchema),
  AchatController.updateAchat
);
router.post("/:id/annuler", verifyAccessToken, authorize('admin'), AchatController.deleteAchat);
router.delete("/:id", verifyAccessToken, authorize('admin'), AchatController.deleteAchat);

export default router;
