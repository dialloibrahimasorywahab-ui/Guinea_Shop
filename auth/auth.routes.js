import express from "express";
import AuthController from "./auth.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import validate from "../common/validator/validator.js";
import createRateLimiter from "../common/middleware/rateLimiter.js";
import { loginSchema, refreshTokenSchema } from "./auth.validator.js";

const router = express.Router();

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: "Trop de tentatives de connexion infructueuses. Veuillez réessayer dans 15 minutes.",
    code: "RATE_LIMIT_EXCEEDED",
  },
});

const refreshLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: "Trop de requêtes de rafraîchissement de token. Veuillez patienter.",
    code: "RATE_LIMIT_EXCEEDED",
  },
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: "Authentification de l'utilisateur (Génération des tokens JWT)"
 *     tags: [Authentification]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [login, password]
 *             properties:
 *               login:
 *                 type: string
 *                 description: "Login ou adresse email de l'utilisateur"
 *                 example: ""
 *               password:
 *                 type: string
 *                 description: "Mot de passe"
 *                 example: ""
 *     responses:
 *       200:
 *         description: Authentification réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken: { type: string, example: "" }
 *                     refreshToken: { type: string, example: "" }
 *                     token: { type: string, example: "" }
 *                     user: { $ref: '#/components/schemas/User' }
 *                 message: { type: string, example: "Connexion réussie" }
 *       400:
 *         description: Paramètres manquants
 *       401:
 *         description: Identifiants invalides
 */
router.post("/login", authLimiter, validate(loginSchema), AuthController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: "Rafraîchir le token d'accès via le refresh token"
 *     tags: [Authentification]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: "Token de rafraîchissement JWT"
 *                 example: ""
 *     responses:
 *       200:
 *         description: Nouveau token d'accès généré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken: { type: string, example: "" }
 *                     refreshToken: { type: string, example: "" }
 *                     token: { type: string, example: "" }
 *                 message: { type: string, example: "Token rafraîchi avec succès" }
 *       400:
 *         description: Refresh token manquant
 *       401:
 *         description: Refresh token invalide ou expiré
 */
router.post("/refresh", refreshLimiter, validate(refreshTokenSchema), AuthController.refreshToken);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: "Profil de l'utilisateur actuellement connecté"
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données du profil connecté
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Non authentifié ou token expiré
 */
router.get("/me", verifyAccessToken, AuthController.me);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: "Déconnexion de l'utilisateur (Révocation du refresh token)"
 *     tags: [Authentification]
 *     security: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: ""
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post("/logout", AuthController.logout);

export default router;
