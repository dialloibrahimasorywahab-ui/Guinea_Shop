import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import usersRoutes from './users/users.routes.js';
import categoriesRoutes from './categories/categories.routes.js';
import clientsRoutes from './clients/clients.routes.js';
import fournisseursRoutes from './fournisseur/fournisseur.routes.js';
import articlesRoutes from './articles/articles.routes.js';
import ventesRoutes from './ventes/ventes.routes.js';
import ligneVentesRoutes from './ligne_ventes/ligne_ventes.routes.js';
import facturesRoutes from './factures/factures.routes.js';
import paiementsRoutes from './paiement/paiement.routes.js';
import stockRoutes from './stock/stock.routes.js';


// Nouveaux modules intégrés sans redondance
import achatsRoutes from './Achats/achats.routes.js';
import ligneAchatsRoutes from './Ligne_achat/ligne_achat.routes.js';
import mouvementsStockRoutes from './Mouvement_stock/mouvement_stock.routes.js';
import financesRoutes from './Finances/finances.routes.js';

import { setupSwagger } from './config/swagger.js';

// Initialisation du serveur Express
const serveur = express();

// Middlewares de sécurité et de réseau
serveur.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
serveur.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Configuration de la documentation Swagger (/api-docs et /api-docs.json)
setupSwagger(serveur);

// Parsers JSON et URL-encoded
serveur.use(express.json());
serveur.use(express.urlencoded({ extended: true }));

// Endpoint de santé de l'API
serveur.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "API GH_Maick opérationnelle",
    timestamp: new Date().toISOString(),
  });
});

// Exposition des différentes routes métier de l'application
serveur.use('/users', usersRoutes);
serveur.use('/categories', categoriesRoutes);
serveur.use('/clients', clientsRoutes);
serveur.use('/fournisseurs', fournisseursRoutes);
serveur.use('/articles', articlesRoutes);
serveur.use('/ventes', ventesRoutes);
serveur.use('/ligne-ventes', ligneVentesRoutes);
serveur.use('/factures', facturesRoutes);
serveur.use('/paiements', paiementsRoutes);

// Modules Achats, Ligne Achat, Mouvement Stock et Finances
serveur.use('/achats', achatsRoutes);
serveur.use('/lignes-achats', ligneAchatsRoutes);
serveur.use('/mouvements-stock', mouvementsStockRoutes);
serveur.use('/stock', stockRoutes); // Synthèse état global (/stock/etat) et mouvements
serveur.use('/finances', financesRoutes);

// Gestionnaire 404 pour les routes non reconnues
serveur.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ressource introuvable : ${req.method} ${req.originalUrl}`,
  });
});

// Middleware global de traitement des erreurs inattendues
serveur.use((err, req, res, next) => {
  console.error("Erreur serveur non interceptée :", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Une erreur interne est survenue sur le serveur",
  });
});

export default serveur;