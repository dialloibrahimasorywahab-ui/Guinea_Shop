import express from "express";
import StockController from "./stock.controller.js";

const router = express.Router();

// Routes spécifiques (précèdent /:id)
router.get("/all", StockController.getAllStockMouvements);
router.get("/article/:articleId", StockController.getMouvementsByArticle);
router.get("/type/:type", StockController.getMouvementsByType);

// Création d'un mouvement de stock
router.post("/", StockController.createStockMouvement);

// Routes dynamiques par ID
router.get("/:id", StockController.getStockById);
router.delete("/:id", StockController.deleteStockMouvement);

export default router;
