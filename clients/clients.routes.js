import express from "express";
import ClientController from "./clients.controller.js";

const router = express.Router();

// Routes spécifiques
router.get("/all", ClientController.getAllClients);
router.get("/telephone/:telephone", ClientController.getClientByTelephone);

// Création d'un client
router.post("/", ClientController.createClient);

// Routes dynamiques par ID
router.get("/:id", ClientController.getClientById);
router.put("/:id", ClientController.updateClient);
router.delete("/:id", ClientController.deleteClient);

export default router;
