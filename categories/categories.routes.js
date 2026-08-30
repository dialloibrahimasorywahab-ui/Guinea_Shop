import express from "express";
import CategoryController from "./categories.controller.js";

const router = express.Router();

// Routes spécifiques (précèdent /:id)
// recuperer toutes les categories des produits disponibles
router.get("/all", CategoryController.getAllCategories);

// Création d'une catégorie d'un produit
router.post("/", CategoryController.createCategory);

// Routes dynamiques par ID
// Route de recuperation d'une categorie de produit par son id
router.get("/:id", CategoryController.getCategoryById);

// Pour la mise à jour d'une categorie 
router.put("/:id", CategoryController.updateCategory);

// pour la supression d'une categorie 
router.delete("/:id", CategoryController.deleteCategory);

export default router;
