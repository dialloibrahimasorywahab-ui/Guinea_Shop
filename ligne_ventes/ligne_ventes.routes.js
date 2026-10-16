import express from "express";
import LigneVenteController from "./ligne_ventes.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";

const router = express.Router();

// Consultation : admin, gestionnaire et caissier
router.get("/all", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), LigneVenteController.getAllLigneVentes);
router.get("/vente/:venteId", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), LigneVenteController.getLignesByVenteId);
router.get("/:id", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), LigneVenteController.getLigneVenteById);

// Création d'une ligne de vente manuelle
router.post("/", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), LigneVenteController.createLigneVente);

// Suppression : réservée à l'admin
router.delete("/:id", verifyAccessToken, authorize('admin'), LigneVenteController.deleteLigneVente);

export default router;
