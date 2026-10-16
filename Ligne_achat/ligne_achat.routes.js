import express from "express";
import LigneAchatController from "./ligne_achat.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";
import validate from "../common/validator/validator.js";
import { createLigneAchatSchema } from "./ligne_achat.validator.js";

const router = express.Router();

// Consultation : admin et gestionnaire
router.get("/all", verifyAccessToken, authorize('admin', 'gestionnaire'), LigneAchatController.getAllLigneAchats);
router.get("/achat/:achatId", verifyAccessToken, authorize('admin', 'gestionnaire'), LigneAchatController.getLignesByAchatId);
router.get("/:id", verifyAccessToken, authorize('admin', 'gestionnaire'), LigneAchatController.getLigneAchatById);

// Création d'une ligne d'achat : admin et gestionnaire
router.post(
  "/",
  verifyAccessToken,
  authorize('admin', 'gestionnaire'),
  validate(createLigneAchatSchema),
  LigneAchatController.createLigneAchat
);

// Suppression : réservée à l'admin
router.delete("/:id", verifyAccessToken, authorize('admin'), LigneAchatController.deleteLigneAchat);

export default router;
