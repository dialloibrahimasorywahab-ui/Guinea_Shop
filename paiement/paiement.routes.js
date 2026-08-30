import express from "express";
import PaiementController from "./paiement.controller.js";

const router = express.Router();

// Routes spécifiques (précèdent /:id)
router.get("/all", PaiementController.getAllPaiements);
router.get("/vente/:venteId", PaiementController.getPaiementsByVente);
router.get("/mode/:mode", PaiementController.getPaiementsByMode);

// Enregistrer un paiement
router.post("/", PaiementController.createPaiement);

// Routes dynamiques par ID
router.get("/:id", PaiementController.getPaiementById);
router.put("/:id", PaiementController.updatePaiement);
router.delete("/:id", PaiementController.deletePaiement);

export default router;
