import express from "express";
import VenteController from "./ventes.controller.js";

const router = express.Router();

// Routes spécifiques (doivent précéder /:id)
router.get("/all", VenteController.getAllVentes);
router.get("/client/:clientId", VenteController.getVentesByClient);
router.get("/user/:userId", VenteController.getVentesByUser);

// Création d'une vente
router.post("/", VenteController.createVente);

// Routes dynamiques par ID
router.get("/:id", VenteController.getVenteById);
router.put("/:id", VenteController.updateVente);
router.delete("/:id", VenteController.deleteVente);

export default router;
