import express from "express";
import FournisseurController from "./fournisseur.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";
import validate from "../common/validator/validator.js";
import { createFournisseurSchema, updateFournisseurSchema } from "./fournisseur.validator.js";

const router = express.Router();

/**
 * @swagger
 * /fournisseurs/all:
 *   get:
 *     summary: Récupérer tous les fournisseurs (Admin et Gestionnaire)
 *     tags: [Fournisseurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de tous les fournisseurs
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 */
router.get("/all", verifyAccessToken, authorize('admin', 'gestionnaire'), FournisseurController.getAllFournisseurs);

/**
 * @swagger
 * /fournisseurs/telephone/{telephone}:
 *   get:
 *     summary: Trouver un fournisseur par son numéro de téléphone
 *     tags: [Fournisseurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: telephone
 *         required: true
 *         schema:
 *           type: string
 *           example: "+224622000000"
 *     responses:
 *       200:
 *         description: Fournisseur trouvé
 *       404:
 *         description: Aucun fournisseur avec ce numéro
 */
router.get("/telephone/:telephone", verifyAccessToken, authorize('admin', 'gestionnaire'), FournisseurController.getFournisseurByTelephone);

/**
 * @swagger
 * /fournisseurs/{id}:
 *   get:
 *     summary: Obtenir les détails d'un fournisseur
 *     tags: [Fournisseurs]
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
 *         description: Détails du fournisseur
 *       404:
 *         description: Fournisseur introuvable
 *   put:
 *     summary: Mettre à jour un fournisseur (Admin ou Gestionnaire)
 *     tags: [Fournisseurs]
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
 *             properties:
 *               nom: { type: string, example: "Textiles & Costumes d'Italie" }
 *               telephone: { type: string, example: "+39021234567" }
 *               email: { type: string, example: "contact@sartoriamilano.it" }
 *               adresse: { type: string, example: "Via Montenapoleone, Milano" }
 *     responses:
 *       200:
 *         description: Fournisseur mis à jour
 *       400:
 *         description: Erreur de validation
 *   delete:
 *     summary: Supprimer un fournisseur (Admin uniquement)
 *     tags: [Fournisseurs]
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
 *         description: Fournisseur supprimé
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Fournisseur introuvable
 */
router.get("/:id", verifyAccessToken, authorize('admin', 'gestionnaire'), FournisseurController.getFournisseurById);

/**
 * @swagger
 * /fournisseurs:
 *   post:
 *     summary: Enregistrer un nouveau fournisseur (Admin ou Gestionnaire)
 *     tags: [Fournisseurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, telephone]
 *             properties:
 *               nom: { type: string, example: "Atelier Confection Guinée" }
 *               telephone: { type: string, example: "+224625556677" }
 *               email: { type: string, example: "contact@atelierguinee.com" }
 *               adresse: { type: string, example: "Madina Marché, Conakry" }
 *     responses:
 *       201:
 *         description: Fournisseur créé avec succès
 *       400:
 *         description: Erreur de validation
 */
router.post(
  "/",
  verifyAccessToken,
  authorize('admin', 'gestionnaire'),
  validate(createFournisseurSchema),
  FournisseurController.createFournisseur
);
router.put(
  "/:id",
  verifyAccessToken,
  authorize('admin', 'gestionnaire'),
  validate(updateFournisseurSchema),
  FournisseurController.updateFournisseur
);
router.delete("/:id", verifyAccessToken, authorize('admin'), FournisseurController.deleteFournisseur);

export default router;
