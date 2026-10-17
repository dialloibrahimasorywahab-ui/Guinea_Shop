import express from "express";
import CategoryController from "./categories.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";
import validate from "../common/validator/validator.js";
import { createCategorySchema, updateCategorySchema } from "./categories.validator.js";

const router = express.Router();

/**
 * @swagger
 * /categories/all:
 *   get:
 *     summary: Récupérer toutes les catégories
 *     tags: [Catégories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de toutes les catégories
 *       401:
 *         description: Non authentifié
 */
router.get("/all", verifyAccessToken, CategoryController.getAllCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Obtenir les détails d'une catégorie
 *     tags: [Catégories]
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
 *         description: Détails de la catégorie
 *       404:
 *         description: Catégorie introuvable
 *   put:
 *     summary: Mettre à jour une catégorie (Admin ou Gestionnaire)
 *     tags: [Catégories]
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
 *               nom: { type: string, example: "Costumes & Smokings" }
 *               description: { type: string, example: "Costumes sur mesure et haute couture" }
 *     responses:
 *       200:
 *         description: Catégorie mise à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       403:
 *         description: Rôle insuffisant
 *   delete:
 *     summary: Supprimer une catégorie (Admin uniquement)
 *     tags: [Catégories]
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
 *         description: Catégorie supprimée
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Catégorie introuvable
 */
router.get("/:id", verifyAccessToken, CategoryController.getCategoryById);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Créer une nouvelle catégorie (Admin ou Gestionnaire)
 *     tags: [Catégories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom]
 *             properties:
 *               nom: { type: string, example: "Costumes & Smokings" }
 *               description: { type: string, example: "Collection homme élégance" }
 *     responses:
 *       201:
 *         description: Catégorie créée avec succès
 *       400:
 *         description: Nom de catégorie manquant ou invalide
 *       403:
 *         description: Accès interdit
 */
router.post(
  "/",
  verifyAccessToken,
  authorize('admin', 'gestionnaire'),
  validate(createCategorySchema),
  CategoryController.createCategory
);
router.put(
  "/:id",
  verifyAccessToken,
  authorize('admin', 'gestionnaire'),
  validate(updateCategorySchema),
  CategoryController.updateCategory
);
router.delete("/:id", verifyAccessToken, authorize('admin'), CategoryController.deleteCategory);

export default router;
