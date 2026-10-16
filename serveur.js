import 'dotenv/config';
import mongoose from 'mongoose';
import serveur from './app.js';
import connectDB from './config/db/db.config.js';

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    // 1. Établir la connexion à MongoDB avant d'ouvrir le port HTTP
    console.log("Tentative de connexion à MongoDB...");
    await connectDB();

    // 2. Démarrer le serveur Express uniquement si la base est connectée
    const serverInstance = serveur.listen(PORT, () => {
      console.log(`🚀 Serveur opérationnel et à l'écoute sur http://localhost:${PORT}`);
    });

    // 3. Gestion propre de l'arrêt du serveur (Graceful Shutdown)
    const gracefulShutdown = async (signal) => {
      console.log(`\nSignal [${signal}] reçu : fermeture gracieuse du serveur...`);
      serverInstance.close(async () => {
        console.log("Serveur HTTP fermé.");
        await mongoose.connection.close();
        console.log("Connexion MongoDB fermée.");
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error) {
    console.error('❌ Échec critique au démarrage du serveur :', error.message);
    process.exit(1);
  }
};

startServer();
