import express from "express";
import FactureController from "./factures.controller.js";

const router = express.Router();

// Routes spécifiques (précèdent /:id)
router.get("/all", FactureController.getAllFactures);
router.get("/vente/:venteId", FactureController.getFactureByVenteId);
router.get("/client/:clientId", FactureController.getFacturesByClient);

// Générer une facture
router.post("/generer", FactureController.createFactureFromVente);

// Routes dynamiques par ID
router.get("/:id", FactureController.getFactureById);
router.delete("/:id", FactureController.deleteFacture);

export default router;
