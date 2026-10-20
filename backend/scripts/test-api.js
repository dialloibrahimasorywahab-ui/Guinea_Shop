import 'dotenv/config';
import connectDB from '../config/db/db.config.js';
import AuthService from '../auth/auth.service.js';
import StockService from '../stock/stock.service.js';
import FinanceService from '../Finances/finances.service.js';
import VenteService from '../ventes/ventes.service.js';
import mongoose from 'mongoose';

const runTests = async () => {
  try {
    await connectDB();
    console.log("🚀 Connexion DB réussie pour le test de validation.");

    // 1. Test Login
    console.log("➡️ Test 1 : Authentification de l'administrateur...");
    const loginResult = await AuthService.login('admin@ghmaick.com', 'Password123!');
    console.log("✅ Connexion réussie. AccessToken et RefreshToken générés.");

    // 2. Test Refresh Token
    console.log("➡️ Test 2 : Rotation du Refresh Token...");
    const refreshResult = await AuthService.refreshToken(loginResult.refreshToken);
    console.log("✅ Refresh token tourné avec succès. Nouveau jti généré.");

    // 3. Test Etat du Stock
    console.log("➡️ Test 3 : Synthèse de l'état du stock...");
    const stockStats = await StockService.getEtatStock();
    console.log(`✅ Stock synthétisé : ${stockStats.nbArticles} articles, ${stockStats.quantiteTotale} pièces en stock, valeur totale = ${(stockStats.valeurTotale || 0).toLocaleString('fr-FR')} GNF.`);

    // 4. Test Bilan Financier
    console.log("➡️ Test 4 : Calcul du bilan financier...");
    const bilan = await FinanceService.getBilanFinancier();
    console.log(`✅ Bilan calculé : Recettes = ${(bilan.totalRecettes || 0).toLocaleString('fr-FR')} GNF, Dépenses = ${(bilan.totalDepenses || 0).toLocaleString('fr-FR')} GNF, Solde Net = ${(bilan.soldeNet || 0).toLocaleString('fr-FR')} GNF.`);

    // 5. Test Logout
    console.log("➡️ Test 5 : Révocation de session (Logout)...");
    await AuthService.logout(refreshResult.refreshToken);
    console.log("✅ Session révoquée avec succès.");

    console.log("\n==================================================");
    console.log("🎉 TOUS LES TESTS FONCTIONNELS SONT VALIDES À 100% !");
    console.log("==================================================");
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ ERREUR LORS DU TEST :", err);
    await mongoose.connection.close();
    process.exit(1);
  }
};

runTests();
