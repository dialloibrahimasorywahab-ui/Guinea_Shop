import express from "express";
import UserController from "./users.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";
import validate from "../common/validator/validator.js";
import { createUserSchema, updateUserSchema } from "./users.validator.js";

const router = express.Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: "Créer un nouvel utilisateur (Admin uniquement)"
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, prenom, email, password, role]
 *             properties:
 *               login: { type: string, example: "" }
 *               nom: { type: string, example: "" }
 *               prenom: { type: string, example: "" }
 *               email: { type: string, example: "" }
 *               password: { type: string, example: "" }
 *               telephone: { type: string, example: "" }
 *               role: { type: string, enum: [admin, gestionnaire, caissier, client], example: "client" }
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 */
router.post("/", verifyAccessToken, authorize('admin'), validate(createUserSchema), UserController.createUser);

/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: "Obtenir la liste de tous les utilisateurs"
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, gestionnaire, caissier, client]
 *         description: "Filtrer directement par rôle d'utilisateur"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: "Recherche textuelle par nom, prénom, login, email ou téléphone"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [nom, prenom, login, email, role, createdAt]
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
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 */
router.get("/all", verifyAccessToken, authorize('admin', 'gestionnaire'), UserController.getAllUsers);

/**
 * @swagger
 * /users/role/{role}:
 *   get:
 *     summary: "Filtrer les utilisateurs par rôle"
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [admin, gestionnaire, caissier, client]
 *     responses:
 *       200:
 *         description: Liste filtrée
 */
router.get("/role/:role", verifyAccessToken, authorize('admin', 'gestionnaire'), UserController.getUserByRole);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: "Obtenir un utilisateur par son ID"
 *     tags: [Utilisateurs]
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
 *         description: Utilisateur trouvé
 *   put:
 *     summary: "Mettre à jour un utilisateur (Admin uniquement)"
 *     tags: [Utilisateurs]
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
 *         description: Utilisateur mis à jour
 *   delete:
 *     summary: "Supprimer un utilisateur (Admin uniquement)"
 *     tags: [Utilisateurs]
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
 *         description: Utilisateur supprimé
 */
router.get("/:id", verifyAccessToken, UserController.getUserById);
router.put("/:id", verifyAccessToken, authorize('admin'), validate(updateUserSchema), UserController.updateUser);
router.delete("/:id", verifyAccessToken, authorize('admin'), UserController.deleteUser);

export default router;
