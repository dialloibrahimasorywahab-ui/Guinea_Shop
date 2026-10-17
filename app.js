import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import path from 'path';

import authRoutes from './auth/auth.routes.js';
import uploadRoutes from './upload/upload.routes.js';
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
import errorHandler from './common/middleware/errorHandler.js';

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

// Parsers JSON et URL-encoded avec restriction stricte de taille (T5.3)
serveur.use(express.json({ limit: '100kb' }));
serveur.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Endpoint de santé de l'API
serveur.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: "API GH_Maick opérationnelle",
        timestamp: new Date().toISOString(),
    });
});

// Exposition statique du répertoire de stockage des uploads
serveur.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Exposition des différentes routes métier de l'application
serveur.use('/auth', authRoutes);
serveur.use('/uploads', uploadRoutes);
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

// Middleware global de traitement unifié des erreurs (T6.5, V8)
serveur.use(errorHandler);

export default serveur;