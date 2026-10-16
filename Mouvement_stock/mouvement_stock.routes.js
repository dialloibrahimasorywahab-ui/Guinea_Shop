import express from "express";
import MouvementStockController from "./mouvement_stock.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";
import validate from "../common/validator/validator.js";
import { createMouvementStockSchema } from "./mouvement_stock.validator.js";

const router = express.Router();

// Consultation : admin et gestionnaire
router.get("/all", verifyAccessToken, authorize('admin', 'gestionnaire'), MouvementStockController.getAllMouvements);
router.get("/article/:articleId", verifyAccessToken, authorize('admin', 'gestionnaire'), MouvementStockController.getMouvementsByArticle);
router.get("/type/:type", verifyAccessToken, authorize('admin', 'gestionnaire'), MouvementStockController.getMouvementsByType);
router.get("/:id", verifyAccessToken, authorize('admin', 'gestionnaire'), MouvementStockController.getMouvementById);

// Enregistrement manuel de mouvement : admin et gestionnaire
router.post(
  "/",
  verifyAccessToken,
  authorize('admin', 'gestionnaire'),
  validate(createMouvementStockSchema),
  MouvementStockController.createMouvement
);

// Suppression : réservée à l'admin
router.delete("/:id", verifyAccessToken, authorize('admin'), MouvementStockController.deleteMouvement);

export default router;
