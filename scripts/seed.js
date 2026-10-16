import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import connectDB from '../config/db/db.config.js';

// Modèles
import userModel from '../users/models/users.models.js';
import categoryModel from '../categories/models/categories.models.js';
import fournisseurModel from '../fournisseur/models/fournisseur.models.js';
import clientModel from '../clients/models/clients.models.js';
import articleModel from '../articles/models/articles.models.js';
import mouvementStockModel from '../Mouvement_stock/models/mouvement_stock.models.js';
import achatModel from '../Achats/models/achats.models.js';
import ligneAchatModel from '../Ligne_achat/models/ligne_achat.models.js';
import venteModel from '../ventes/models/ventes.models.js';
import ligneVenteModel from '../ligne_ventes/models/ligne_ventes.models.js';
import factureModel from '../factures/models/factures.models.js';
import paiementModel from '../paiement/models/paiement.models.js';
import financeModel from '../Finances/models/finances.models.js';

const seedDatabase = async () => {
  try {
    console.log("==================================================");
    console.log("🌱 Début de l'initialisation des données (SEED)...");
    console.log("==================================================");

    await connectDB();

    console.log("\n🧹 1. Nettoyage des collections existantes...");
    await Promise.all([
      userModel.deleteMany({}),
      categoryModel.deleteMany({}),
      fournisseurModel.deleteMany({}),
      clientModel.deleteMany({}),
      articleModel.deleteMany({}),
      mouvementStockModel.deleteMany({}),
      achatModel.deleteMany({}),
      ligneAchatModel.deleteMany({}),
      venteModel.deleteMany({}),
      ligneVenteModel.deleteMany({}),
      factureModel.deleteMany({}),
      paiementModel.deleteMany({}),
      financeModel.deleteMany({}),
    ]);
    console.log(" Collections vidées avec succès.");

    // 2. Utilisateurs
    console.log("\n👤 2. Création des utilisateurs avec rôles RBAC...");
    const defaultPassword = await bcrypt.hash("Password123!", 10);

    const users = await userModel.insertMany([
      {
        nom: "Diallo",
        prenom: "Ibrahima Sory",
        email: "admin@ghmaick.com",
        telephone: "+224621000001",
        role: "admin",
        password: defaultPassword,
      },
      {
        nom: "Bah",
        prenom: "Mamadou",
        email: "gestionnaire@ghmaick.com",
        telephone: "+224621000002",
        role: "gestionnaire",
        password: defaultPassword,
      },
      {
        nom: "Camara",
        prenom: "Fatoumata",
        email: "caissier@ghmaick.com",
        telephone: "+224621000003",
        role: "caissier",
        password: defaultPassword,
      },
      {
        nom: "Sow",
        prenom: "Alpha",
        email: "client@ghmaick.com",
        telephone: "+224621000004",
        role: "client",
        password: defaultPassword,
      },
    ]);
    console.log(` ${users.length} utilisateurs créés (Mot de passe pour tous : "Password123!")`);
    const [adminUser, gestionnaireUser, caissierUser] = users;

    // 3. Catégories
    console.log("\n 3. Création des catégories de produits...");
    const categories = await categoryModel.insertMany([
      {
        nom: "Informatique & Bureautique",
        description: "Ordinateurs, périphériques, imprimantes et consommables",
      },
      {
        nom: "Téléphonie & Mobilité",
        description: "Smartphones haut de gamme, tablettes et accessoires mobiles",
      },
      {
        nom: "Réseaux & Sécurité",
        description: "Équipements réseau d'entreprise, routeurs, switchs et caméras",
      },
      {
        nom: "Énergie & Onduleurs",
        description: "Onduleurs, régulateurs de tension et batteries de secours",
      },
    ]);
    console.log(` ${categories.length} catégories créées.`);
    const [catInfo, catTel, catReseau, catEnergie] = categories;

    // 4. Fournisseurs
    console.log("\n 4. Création des partenaires fournisseurs...");
    const fournisseurs = await fournisseurModel.insertMany([
      {
        nom: "Global Tech Distribution",
        email: "contact@globaltech.com",
        telephone: "+224622112233",
        adresse: "Centre Commercial Madina, Conakry",
      },
      {
        nom: "Syli Import-Export",
        email: "commercial@syliimport.gn",
        telephone: "+224622445566",
        adresse: "Boulevard du Commerce, Kaloum, Conakry",
      },
      {
        nom: "Africa Digital Hub",
        email: "info@africadigital.com",
        telephone: "+224622778899",
        adresse: "Carrefour Matam, Conakry",
      },
    ]);
    console.log(` ${fournisseurs.length} fournisseurs créés.`);
    const [fournisseurTech, fournisseurSyli, fournisseurDigital] = fournisseurs;

    // 5. Clients
    console.log("\n👥 5. Création des clients...");
    const clients = await clientModel.insertMany([
      {
        nom: "Entreprise BTP Guinée",
        prenom: "Direction Générale",
        email: "contact@btpguinee.gn",
        telephone: "+224625112233",
        adresse: "Immeuble Almamya, Kaloum, Conakry",
      },
      {
        nom: "Barry",
        prenom: "Aïssatou",
        email: "aissatou.barry@yahoo.fr",
        telephone: "+224625445566",
        adresse: "Quartier Kipé, Ratoma, Conakry",
      },
      {
        nom: "Sylla",
        prenom: "Ousmane",
        email: "ousmane.sylla@gmail.com",
        telephone: "+224625778899",
        adresse: "Minière, Dixinn, Conakry",
      },
    ]);
    console.log(` ${clients.length} clients créés.`);
    const [clientEntreprise, clientBarry, clientSylla] = clients;

    // 6. Articles & Stock initial
    console.log("\n 6. Création des articles en stock...");
    const articles = await articleModel.insertMany([
      {
        fournisseur_id: fournisseurTech._id,
        categorie_id: catInfo._id,
        libelle: "Ordinateur Portable Dell XPS 15",
        description: "Intel Core i7 13e Gen, 32 Go RAM, 1 To SSD, Écran 4K OLED",
        prixUnitaire: 14500000,
        quantiteEnStock: 10,
        seuilAlerte: 2,
      },
      {
        fournisseur_id: fournisseurTech._id,
        categorie_id: catInfo._id,
        libelle: "Imprimante HP LaserJet Pro M404dn",
        description: "Imprimante monochrome laser rapide recto-verso réseau",
        prixUnitaire: 3200000,
        quantiteEnStock: 15,
        seuilAlerte: 3,
      },
      {
        fournisseur_id: fournisseurSyli._id,
        categorie_id: catTel._id,
        libelle: "iPhone 15 Pro Max 256GB",
        description: "Puce A17 Pro, Châssis Titane, Zoom optique 5x",
        prixUnitaire: 15500000,
        quantiteEnStock: 8,
        seuilAlerte: 2,
      },
      {
        fournisseur_id: fournisseurSyli._id,
        categorie_id: catTel._id,
        libelle: "Samsung Galaxy S24 Ultra 512GB",
        description: "Snapdragon 8 Gen 3, S-Pen intégré, Galaxy AI",
        prixUnitaire: 14200000,
        quantiteEnStock: 12,
        seuilAlerte: 2,
      },
      {
        fournisseur_id: fournisseurDigital._id,
        categorie_id: catReseau._id,
        libelle: "Routeur Cisco Gigabit Dual-WAN",
        description: "Routeur VPN d'entreprise avec pare-feu matériel intégré",
        prixUnitaire: 2800000,
        quantiteEnStock: 20,
        seuilAlerte: 4,
      },
      {
        fournisseur_id: fournisseurDigital._id,
        categorie_id: catEnergie._id,
        libelle: "Onduleur APC Smart-UPS 1500VA",
        description: "Protection de puissance sinusoïdale pure avec écran LCD",
        prixUnitaire: 3900000,
        quantiteEnStock: 1, // En dessous du seuil pour tester les alertes !
        seuilAlerte: 3,
      },
    ]);
    console.log(` ${articles.length} articles créés (dont 1 en alerte de stock).`);
    const [artDell, artImprimante, artIphone, artSamsung, artRouteur, artOnduleur] = articles;

    // 7. Traçabilité des mouvements d'ouverture de stock
    console.log("\n📋 7. Enregistrement des mouvements de stock initiaux...");
    const initialMovements = articles.map((art) => ({
      article_id: art._id,
      user_id: adminUser._id,
      typeMouvement: "entrée",
      quantite: art.quantiteEnStock,
      motif: "Stock initial d'ouverture du magasin",
      dateMouvement: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // il y a 30 jours
    }));
    await mouvementStockModel.insertMany(initialMovements);
    console.log(` ${initialMovements.length} mouvements de stock d'ouverture enregistrés.`);

    // 8. Achats Fournisseurs & Décaissements
    console.log("\n 8. Création d'une commande d'achat fournisseur...");
    const achatDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    const achatTotal = 3 * 11000000 + 5 * 2500000; // 3 Dell à 11M + 5 HP à 2.5M = 45 500 000

    const achat = await achatModel.create({
      numeroAchat: "ACH-2026-0001",
      fournisseur_id: fournisseurTech._id,
      montantTotal: achatTotal,
      statut: "reçu",
      statutPaiement: "payé",
      user_id: gestionnaireUser._id,
      dateAchat: achatDate,
    });

    await ligneAchatModel.insertMany([
      {
        achat_id: achat._id,
        article_id: artDell._id,
        quantite: 3,
        prixAchatUnitaire: 11000000,
        sousTotal: 33000000,
      },
      {
        achat_id: achat._id,
        article_id: artImprimante._id,
        quantite: 5,
        prixAchatUnitaire: 2500000,
        sousTotal: 12500000,
      },
    ]);

    // Écriture de dépense dans Finances
    await financeModel.create({
      type: "dépense",
      categorie: "achat",
      montant: achatTotal,
      modePaiement: "virement",
      description: `Règlement Achat N° ${achat.numeroAchat} - Global Tech Distribution`,
      user_id: gestionnaireUser._id,
      achat_id: achat._id,
      dateTransaction: achatDate,
    });
    console.log(` Achat créé avec 2 lignes d'achats et 1 dépense Finances (${achatTotal.toLocaleString()} GNF).`);

    // 9. Vente N° 1 (Totalement Payée)
    console.log("\n💰 9. Création d'une vente N°1 réglée en totalité...");
    const venteDate1 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const totalVente1 = 2 * artDell.prixUnitaire + 1 * artImprimante.prixUnitaire; // 29M + 3.2M = 32 200 000

    const vente1 = await venteModel.create({
      client_id: clientEntreprise._id,
      user_id: caissierUser._id,
      numeroFacture: "FAC-2026-0001",
      montantTotal: totalVente1,
      statut: "payée",
      createdAt: venteDate1,
    });

    await ligneVenteModel.insertMany([
      {
        vente_id: vente1._id,
        article_id: artDell._id,
        quantite: 2,
        prixUnitaire: artDell.prixUnitaire,
        sousTotal: 2 * artDell.prixUnitaire,
      },
      {
        vente_id: vente1._id,
        article_id: artImprimante._id,
        quantite: 1,
        prixUnitaire: artImprimante.prixUnitaire,
        sousTotal: artImprimante.prixUnitaire,
      },
    ]);

    // Mouvements de stock pour la vente 1
    await mouvementStockModel.insertMany([
      {
        article_id: artDell._id,
        user_id: caissierUser._id,
        typeMouvement: "sortie",
        quantite: 2,
        motif: `Vente N° ${vente1.numeroFacture}`,
        vente_id: vente1._id,
        dateMouvement: venteDate1,
      },
      {
        article_id: artImprimante._id,
        user_id: caissierUser._id,
        typeMouvement: "sortie",
        quantite: 1,
        motif: `Vente N° ${vente1.numeroFacture}`,
        vente_id: vente1._id,
        dateMouvement: venteDate1,
      },
    ]);

    // Facture Vente 1
    const facture1 = await factureModel.create({
      vente_id: vente1._id,
      numeroFacture: vente1.numeroFacture,
      client_id: clientEntreprise._id,
      montantTotal: totalVente1,
      montantPaye: totalVente1,
      montantRestant: 0,
      statut: "payée",
      dateEmission: venteDate1,
    });

    // Paiement Vente 1
    const paiement1 = await paiementModel.create({
      vente_id: vente1._id,
      modePaiement: "virement",
      montant: totalVente1,
      statut: "validé",
      datePaiement: venteDate1,
    });

    // Écriture Recette Vente 1 dans Finances
    await financeModel.create({
      type: "recette",
      categorie: "vente",
      montant: totalVente1,
      modePaiement: "virement",
      description: `Encaissement Facture N° ${facture1.numeroFacture} - Entreprise BTP Guinée`,
      user_id: caissierUser._id,
      vente_id: vente1._id,
      facture_id: facture1._id,
      paiement_id: paiement1._id,
      dateTransaction: venteDate1,
    });
    console.log(` Vente 1 (${totalVente1.toLocaleString()} GNF) avec Facture, Paiement et Recette dans Finances.`);

    // 10. Vente N° 2 (Partiellement payée)
    console.log("\n💳 10. Création d'une vente N°2 partiellement payée...");
    const venteDate2 = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const totalVente2 = 1 * artIphone.prixUnitaire; // 15 500 000
    const acompte = 10000000;
    const resteAPayer = totalVente2 - acompte;

    const vente2 = await venteModel.create({
      client_id: clientBarry._id,
      user_id: caissierUser._id,
      numeroFacture: "FAC-2026-0002",
      montantTotal: totalVente2,
      statut: "en_attente",
      createdAt: venteDate2,
    });

    await ligneVenteModel.create({
      vente_id: vente2._id,
      article_id: artIphone._id,
      quantite: 1,
      prixUnitaire: artIphone.prixUnitaire,
      sousTotal: totalVente2,
    });

    await mouvementStockModel.create({
      article_id: artIphone._id,
      user_id: caissierUser._id,
      typeMouvement: "sortie",
      quantite: 1,
      motif: `Vente N° ${vente2.numeroFacture}`,
      vente_id: vente2._id,
      dateMouvement: venteDate2,
    });

    const facture2 = await factureModel.create({
      vente_id: vente2._id,
      numeroFacture: vente2.numeroFacture,
      client_id: clientBarry._id,
      montantTotal: totalVente2,
      montantPaye: acompte,
      montantRestant: resteAPayer,
      statut: "partiellement_payée",
      dateEmission: venteDate2,
    });

    const paiement2 = await paiementModel.create({
      vente_id: vente2._id,
      modePaiement: "mobile_money",
      montant: acompte,
      statut: "validé",
      datePaiement: venteDate2,
    });

    await financeModel.create({
      type: "recette",
      categorie: "vente",
      montant: acompte,
      modePaiement: "mobile_money",
      description: `Acompte Facture N° ${facture2.numeroFacture} - Aïssatou Barry`,
      user_id: caissierUser._id,
      vente_id: vente2._id,
      facture_id: facture2._id,
      paiement_id: paiement2._id,
      dateTransaction: venteDate2,
    });
    console.log(` Vente 2 (${totalVente2.toLocaleString()} GNF) : acompte ${acompte.toLocaleString()} GNF, reste ${resteAPayer.toLocaleString()} GNF.`);

    // 11. Charges diverses (Loyer, Salaire, Internet) dans Finances
    console.log("\n💵 11. Enregistrement des charges de fonctionnement dans Finances...");
    await financeModel.insertMany([
      {
        type: "dépense",
        categorie: "loyer",
        montant: 5000000,
        modePaiement: "virement",
        description: "Loyer mensuel showroom commercial",
        user_id: adminUser._id,
        dateTransaction: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        type: "dépense",
        categorie: "charge",
        montant: 850000,
        modePaiement: "espèces",
        description: "Abonnement fibre optique et internet du magasin",
        user_id: gestionnaireUser._id,
        dateTransaction: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(" Charges d'exploitation enregistrées dans Finances.");

    console.log("\n==================================================");
    console.log("🎉 SEED TERMINÉ AVEC SUCCÈS !");
    console.log("==================================================");
    console.log("\n Identifiants pour tester l'API :");
    console.log("   Admin        : admin@ghmaick.com / Password123!");
    console.log("   Gestionnaire : gestionnaire@ghmaick.com / Password123!");
    console.log("   Caissier     : caissier@ghmaick.com / Password123!");
    console.log("   Client       : client@ghmaick.com / Password123!");
    console.log("\n📚 Swagger UI disponible sur http://localhost:8000/api-docs");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Erreur pendant le seed :", error);
    process.exit(1);
  }
};

seedDatabase();
