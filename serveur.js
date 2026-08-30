console.log("ibstech");

import express from 'express';
import connectDB from './config/db/db.config.js';
import usersRoutes from './users/users.routes.js';
import clientsRoutes from './clients/clients.routes.js';
import fournisseursRoutes from './fournisseur/fournisseur.routes.js';
import articlesRoutes from './articles/articles.routes.js';
import ventesRoutes from './ventes/ventes.routes.js';
import stockRoutes from './stock/stock.routes.js';
import ligneVentesRoutes from './ligne_ventes/ligne_ventes.routes.js';
import paiementsRoutes from './paiement/paiement.routes.js';
// import categoriesRoutes from './categories/categories.routes.js';
// import statistiquesRoutes from './statistiques/statistique.routes.js';

const serveur = express();

serveur.use(express.json());
serveur.use(express.urlencoded({ extended: true }));

serveur.use('/users', usersRoutes);
serveur.use('/clients', clientsRoutes);
serveur.use('/fournisseurs', fournisseursRoutes);
serveur.use('/articles', articlesRoutes);
serveur.use('/ventes', ventesRoutes);
serveur.use('/stock', stockRoutes);
serveur.use('/ligne-ventes', ligneVentesRoutes);
serveur.use('/paiements', paiementsRoutes);

const startServer = async () => {
  try {
    await connectDB();
    serveur.listen(8000, () => {
      console.log('le serveur est lancé sur le port 8000');
    });
  } catch (error) {
    console.error('Erreur de démarrage du serveur :', error.message);
    process.exit(1);
  }
};

startServer();
