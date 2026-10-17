import express from "express";
import LigneVenteController from "./ligne_ventes.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";

const router = express.Router();

/**
 * @swagger
 * /ligne-ventes/all:
 *   get:
 *     summary: Récupérer toutes les lignes de vente (Admin, Gestionnaire, Caissier)
 *     tags: [Lignes de Vente]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de toutes les lignes de vente enregistrées
 *       401:
 *         description: Non authentifié
 */
router.get("/all", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), LigneVenteController.getAllLigneVentes);

/**
 * @swagger
 * /ligne-ventes/vente/{venteId}:
 *   get:
 *     summary: Récupérer les lignes associées à une commande / vente spécifique
 *     tags: [Lignes de Vente]
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
 *         description: Lignes de la vente demandée
 *       404:
 *         description: Aucune ligne pour cette vente
 */
router.get("/vente/:venteId", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), LigneVenteController.getLignesByVenteId);

/**
 * @swagger
 * /ligne-ventes/{id}:
 *   get:
 *     summary: Obtenir les détails d'une ligne de vente par son identifiant
 *     tags: [Lignes de Vente]
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
 *         description: Détails de la ligne de vente
 *       404:
 *         description: Ligne de vente introuvable
 */
router.get("/:id", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), LigneVenteController.getLigneVenteById);

export default router;
