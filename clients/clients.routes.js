import express from "express";
import ClientController from "./clients.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";
import validate from "../common/validator/validator.js";
import { createClientSchema, updateClientSchema } from "./clients.validator.js";

const router = express.Router();

// Consultation : admin, gestionnaire et caissier
router.get("/all", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), ClientController.getAllClients);
router.get("/telephone/:telephone", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), ClientController.getClientByTelephone);
router.get("/:id", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), ClientController.getClientById);

// Création & modification avec validation Yup
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

// Suppression : réservée à l'admin
router.delete("/:id", verifyAccessToken, authorize('admin'), ClientController.deleteClient);

export default router;
