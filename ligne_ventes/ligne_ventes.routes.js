import express from "express";
import LigneVenteController from "./ligne_ventes.controller.js";

const router = express.Router();

// Routes spécifiques
router.get("/all", LigneVenteController.getAllLigneVentes);
router.get("/vente/:venteId", LigneVenteController.getLignesByVenteId);

// Création d'une ligne de vente
router.post("/", LigneVenteController.createLigneVente);

// Routes dynamiques par ID
router.get("/:id", LigneVenteController.getLigneVenteById);
router.delete("/:id", LigneVenteController.deleteLigneVente);

export default router;
