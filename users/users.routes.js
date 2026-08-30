import express from "express";
import UserController from "./users.controller.js";

const router = express.Router();

// Routes spécifiques (doivent précéder les routes dynamiques /:id)
router.get("/all", UserController.getAllUsers);
router.get("/role/:role", UserController.getUserByRole);

// Création d'un utilisateur
router.post("/", UserController.createUser);

// Routes dynamiques par ID
router.get("/:id", UserController.getUserById);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

export default router;



