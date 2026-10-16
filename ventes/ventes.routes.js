import express from "express";
import VenteController from "./ventes.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";
import validate from "../common/validator/validator.js";
import { createVenteSchema, updateVenteSchema } from "./ventes.validator.js";

const router = express.Router();

/**
 * @swagger
 * /ventes/all:
 *   get:
 *     summary: Récupérer la liste de toutes les ventes
 *     tags: [Ventes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de toutes les ventes
 */
router.get("/all", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), VenteController.getAllVentes);

/**
 * @swagger
 * /ventes/client/{clientId}:
 *   get:
 *     summary: Ventes effectuées pour un client
 *     tags: [Ventes]
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
 *         description: Liste des ventes du client
 */
router.get("/client/:clientId", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), VenteController.getVentesByClient);

/**
 * @swagger
 * /ventes/user/{userId}:
 *   get:
 *     summary: Ventes enregistrées par un utilisateur / caissier
 *     tags: [Ventes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des ventes de l'utilisateur
 */
router.get("/user/:userId", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), VenteController.getVentesByUser);

/**
 * @swagger
 * /ventes/{id}:
 *   get:
 *     summary: Détails d'une vente (avec lignes de vente)
 *     tags: [Ventes]
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
 *         description: Vente et ses articles associés
 */
router.get("/:id", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), VenteController.getVenteById);

/**
 * @swagger
 * /ventes:
 *   post:
 *     summary: Créer une vente (Transaction ACID : décrémente le stock, trace les mouvements et génère la facture)
 *     tags: [Ventes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [client_id, items]
 *             properties:
 *               client_id: { type: string, example: "66f0123456789abcdef01238" }
 *               numeroFacture: { type: string, example: "FAC-2026-0001" }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [article_id, quantite]
 *                   properties:
 *                     article_id: { type: string, example: "66f0123456789abcdef01235" }
 *                     quantite: { type: number, example: 2 }
 *     responses:
 *       201:
 *         description: Vente créée avec facture générée et mouvement de stock consigné
 */
router.post(
  "/",
  verifyAccessToken,
  authorize('admin', 'gestionnaire', 'caissier'),
  validate(createVenteSchema),
  VenteController.createVente
);

/**
 * @swagger
 * /ventes/{id}:
 *   put:
 *     summary: Modifier les informations d'une vente
 *     tags: [Ventes]
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
 *         description: Vente mise à jour
 *   delete:
 *     summary: Annuler / Supprimer une vente (Restitue le stock et consigne un mouvement compensatoire)
 *     tags: [Ventes]
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
 *         description: Vente annulée et stock restitué
 */
router.put(
  "/:id",
  verifyAccessToken,
  authorize('admin', 'gestionnaire'),
  validate(updateVenteSchema),
  VenteController.updateVente
);
router.delete("/:id", verifyAccessToken, authorize('admin'), VenteController.deleteVente);

export default router;
