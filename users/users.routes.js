import express from "express";
import UserController from "./users.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";
import validate from "../common/validator/validator.js";
import { createUserSchema, loginSchema, updateUserSchema } from "./users.validator.js";

const router = express.Router();

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Authentification de l'utilisateur (Génération du token JWT)
 *     tags: [Authentification & Utilisateurs]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@ghmaick.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Authentification réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 token: { type: string, example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 *                 data: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Identifiants invalides
 */
router.post('/login', validate(loginSchema), UserController.login);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Créer un nouvel utilisateur (Admin uniquement)
 *     tags: [Authentification & Utilisateurs]
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
 *               nom: { type: string, example: Diallo }
 *               prenom: { type: string, example: Ibrahima }
 *               email: { type: string, example: user@ghmaick.com }
 *               password: { type: string, example: Secret1234 }
 *               telephone: { type: string, example: "+224620000000" }
 *               role: { type: string, enum: [admin, gestionnaire, caissier, client], example: caissier }
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 */
router.post("/", verifyAccessToken, authorize('admin'), validate(createUserSchema), UserController.createUser);

/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: Obtenir la liste de tous les utilisateurs
 *     tags: [Authentification & Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
router.get("/all", verifyAccessToken, authorize('admin', 'gestionnaire'), UserController.getAllUsers);

/**
 * @swagger
 * /users/role/{role}:
 *   get:
 *     summary: Filtrer les utilisateurs par rôle
 *     tags: [Authentification & Utilisateurs]
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
 *     summary: Obtenir un utilisateur par son ID
 *     tags: [Authentification & Utilisateurs]
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
 *     summary: Mettre à jour un utilisateur (Admin uniquement)
 *     tags: [Authentification & Utilisateurs]
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
 *     summary: Supprimer un utilisateur (Admin uniquement)
 *     tags: [Authentification & Utilisateurs]
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
