import express from "express";
import LigneAchatController from "./ligne_achat.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";

const router = express.Router();

/**
 * @swagger
 * /lignes-achats/all:
 *   get:
 *     summary: Récupérer toutes les lignes d'achats (Admin et Gestionnaire)
 *     tags: [Lignes d'Achat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de toutes les lignes d'achats
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 */
router.get("/all", verifyAccessToken, authorize('admin', 'gestionnaire'), LigneAchatController.getAllLigneAchats);

/**
 * @swagger
 * /lignes-achats/achat/{achatId}:
 *   get:
 *     summary: Récupérer les lignes d'une commande d'achat fournisseur spécifique
 *     tags: [Lignes d'Achat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: achatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lignes de l'achat fournisseur
 *       404:
 *         description: Aucune ligne pour cet achat
 */
router.get("/achat/:achatId", verifyAccessToken, authorize('admin', 'gestionnaire'), LigneAchatController.getLignesByAchatId);

/**
 * @swagger
 * /lignes-achats/{id}:
 *   get:
 *     summary: Obtenir les détails d'une ligne d'achat par son identifiant
 *     tags: [Lignes d'Achat]
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
 *         description: Détails de la ligne d'achat
 *       404:
 *         description: Ligne d'achat introuvable
 */
router.get("/:id", verifyAccessToken, authorize('admin', 'gestionnaire'), LigneAchatController.getLigneAchatById);

export default router;
