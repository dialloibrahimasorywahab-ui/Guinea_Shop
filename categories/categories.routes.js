import express from "express";
import CategoryController from "./categories.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";
import validate from "../common/validator/validator.js";
import { createCategorySchema, updateCategorySchema } from "./categories.validator.js";

const router = express.Router();

// Consultation : accessible à tout utilisateur authentifié
router.get("/all", verifyAccessToken, CategoryController.getAllCategories);
router.get("/:id", verifyAccessToken, CategoryController.getCategoryById);

// Création & modification : admin et gestionnaire avec validation Yup
router.post(
  "/",
  verifyAccessToken,
  authorize('admin', 'gestionnaire'),
  validate(createCategorySchema),
  CategoryController.createCategory
);
router.put(
  "/:id",
  verifyAccessToken,
  authorize('admin', 'gestionnaire'),
  validate(updateCategorySchema),
  CategoryController.updateCategory
);

// Suppression : réservée à l'admin
router.delete("/:id", verifyAccessToken, authorize('admin'), CategoryController.deleteCategory);

export default router;
