import express from "express";
import FournisseurController from "./fournisseur.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";
import validate from "../common/validator/validator.js";
import { createFournisseurSchema, updateFournisseurSchema } from "./fournisseur.validator.js";

const router = express.Router();

// Consultation : admin et gestionnaire
router.get("/all", verifyAccessToken, authorize('admin', 'gestionnaire'), FournisseurController.getAllFournisseurs);
router.get("/telephone/:telephone", verifyAccessToken, authorize('admin', 'gestionnaire'), FournisseurController.getFournisseurByTelephone);
router.get("/:id", verifyAccessToken, authorize('admin', 'gestionnaire'), FournisseurController.getFournisseurById);

// Création & modification avec validation Yup
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

// Suppression : réservée à l'admin
router.delete("/:id", verifyAccessToken, authorize('admin'), FournisseurController.deleteFournisseur);

export default router;
