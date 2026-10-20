import express from "express";
import ClientController from "./clients.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";
import validate from "../common/validator/validator.js";
import { createClientSchema, updateClientSchema } from "./clients.validator.js";

const router = express.Router();

/**
 * @swagger
 * /clients/all:
 *   get:
 *     summary: Récupérer tous les clients
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: "Recherche par nom, prénom, téléphone ou email"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [nom, prenom, email, telephone, createdAt]
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
 *         description: Liste de tous les clients
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 */
router.get("/all", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), ClientController.getAllClients);

/**
 * @swagger
 * /clients/telephone/{telephone}:
 *   get:
 *     summary: Trouver un client par son numéro de téléphone
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: telephone
 *         required: true
 *         schema:
 *           type: string
 *           example: "+224620000000"
 *     responses:
 *       200:
 *         description: Client trouvé
 *       404:
 *         description: Aucun client avec ce numéro
 */
router.get("/telephone/:telephone", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), ClientController.getClientByTelephone);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Obtenir les détails d'un client par son identifiant
 *     tags: [Clients]
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
 *         description: Détails du client
 *       404:
 *         description: Client introuvable
 *   put:
 *     summary: Mettre à jour les informations d'un client
 *     tags: [Clients]
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
 *               nom: { type: string, example: "Barry" }
 *               prenom: { type: string, example: "Mamadou" }
 *               telephone: { type: string, example: "+224621112233" }
 *               email: { type: string, example: "mamadou.barry@gmail.com" }
 *               adresse: { type: string, example: "Kipé, Ratoma, Conakry" }
 *     responses:
 *       200:
 *         description: Client mis à jour
 *       400:
 *         description: Erreur de validation
 *   delete:
 *     summary: Supprimer un client (Admin uniquement)
 *     tags: [Clients]
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
 *         description: Client supprimé
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: Client introuvable
 */
router.get("/:id", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), ClientController.getClientById);

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Enregistrer un nouveau client
 *     tags: [Clients]
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
 *               nom: { type: string, example: "Camara" }
 *               prenom: { type: string, example: "Aboubacar" }
 *               telephone: { type: string, example: "+224628889900" }
 *               email: { type: string, example: "aboubacar.camara@gmail.com" }
 *               adresse: { type: string, example: "Dixinn, Conakry" }
 *     responses:
 *       201:
 *         description: Client créé avec succès
 *       400:
 *         description: Erreur de validation des données
 */
router.post(
  "/",
  verifyAccessToken,
  authorize('admin', 'gestionnaire', 'caissier'),
  validate(createClientSchema),
  ClientController.createClient
);
router.put(
  "/:id",
  verifyAccessToken,
  authorize('admin', 'gestionnaire', 'caissier'),
  validate(updateClientSchema),
  ClientController.updateClient
);
router.delete("/:id", verifyAccessToken, authorize('admin'), ClientController.deleteClient);

export default router;
