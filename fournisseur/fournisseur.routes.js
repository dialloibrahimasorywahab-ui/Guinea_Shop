import express from "express";
import FournisseurController from "./fournisseur.controller.js";

const router = express.Router();

// Routes spécifiques (précèdent les routes dynamiques /:id)
router.get("/all", FournisseurController.getAllFournisseurs);
router.get("/telephone/:telephone", FournisseurController.getFournisseurByTelephone);

// Création d'un fournisseur
router.post("/", FournisseurController.createFournisseur);

// Routes dynamiques par ID
router.get("/:id", FournisseurController.getFournisseurById);
router.put("/:id", FournisseurController.updateFournisseur);
router.delete("/:id", FournisseurController.deleteFournisseur);

export default router;
