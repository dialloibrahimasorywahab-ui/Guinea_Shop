import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import connectDB from '../config/db/db.config.js';

// Modèles Mongoose
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
    const url = process.env.DB_URL || 'mongodb://127.0.0.1:27017/gh_maick';
    const estLocale = /(localhost|127\.0\.0\.1)/.test(url);

    if (process.env.NODE_ENV === 'production') {
      console.error('❌ SEED REFUSÉ : Impossible d\'exécuter le seed en environnement de production (risque de suppression de 13 collections).');
      process.exit(1);
    }

    if (!estLocale && !process.argv.includes('--force')) {
      console.error('❌ DB_URL ne pointe pas vers une base locale. Relancez avec l\'argument --force si cette réinitialisation est intentionnelle.');
      process.exit(1);
    }

    console.log("==================================================");
    console.log("👔 Initialisation des données : BOUTIQUE PRÊT-À-PORTER HOMME...");
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

    // 2. Utilisateurs du système
    console.log("\n👤 2. Création des utilisateurs avec rôles RBAC...");
    const defaultPassword = await bcrypt.hash("Password123!", 10);

    const users = await userModel.insertMany([
      {
        login: "admin",
        nom: "Diallo",
        prenom: "Ibrahima Sory",
        email: "admin@ghmaick.com",
        telephone: "+224621000001",
        role: "admin",
        password: defaultPassword,
      },
      {
        login: "gestionnaire",
        nom: "Bah",
        prenom: "Mamadou",
        email: "gestionnaire@ghmaick.com",
        telephone: "+224621000002",
        role: "gestionnaire",
        password: defaultPassword,
      },
      {
        login: "caissier",
        nom: "Camara",
        prenom: "Fatoumata",
        email: "caissier@ghmaick.com",
        telephone: "+224621000003",
        role: "caissier",
        password: defaultPassword,
      },
      {
        login: "client",
        nom: "Sow",
        prenom: "Alpha",
        email: "client@ghmaick.com",
        telephone: "+224621000004",
        role: "client",
        password: defaultPassword,
      },
    ]);
    console.log(` ${users.length} utilisateurs créés (Mot de passe commun : "Password123!")`);
    const [adminUser, gestionnaireUser, caissierUser] = users;

    // 3. Catégories spécifiques boutique homme
    console.log("\n 3. Création des catégories de vêtements pour homme...");
    const categories = await categoryModel.insertMany([
      {
        nom: "Costumes & Smokings",
        description: "Costumes 3 pièces italiens, smokings de gala et vestes de tailleur sur-mesure",
      },
      {
        nom: "Chemises & Polos",
        description: "Chemises col italien, col cassé, popeline de coton d'Égypte et polos mercerisés",
      },
      {
        nom: "Pantalons & Chinos",
        description: "Pantalons habillés en laine vierge, chinos stretch confort et jeans élégants",
      },
      {
        nom: "Souliers & Chaussures",
        description: "Richelieu, mocassins penny loafers en cuir patiné main et bottines chelsea",
      },
      {
        nom: "Accessoires & Maroquinerie",
        description: "Ceintures cuir pleine fleur, cravates en soie de Côme, pochettes et boutons de manchette",
      },
    ]);
    console.log(` ${categories.length} catégories homme créées.`);
    const [catCostumes, catChemises, catPantalons, catChaussures, catAccessoires] = categories;

    // 4. Fournisseurs de mode masculine
    console.log("\n 4. Création des marques et ateliers fournisseurs...");
    const fournisseurs = await fournisseurModel.insertMany([
      {
        nom: "Sartoria Milano Confection",
        email: "contact@sartoriamilano.it",
        telephone: "+224622112233",
        adresse: "Showroom Kaloum & Milan (Italie)",
      },
      {
        nom: "Ateliers Coton & Prestige",
        email: "commandes@cotonprestige.fr",
        telephone: "+224622445566",
        adresse: "Boulevard du Commerce, Kaloum, Conakry",
      },
      {
        nom: "Maroquinerie & Bottiers d'Art",
        email: "service@bottiersdart.com",
        telephone: "+224622778899",
        adresse: "Quartier Minière, Dixinn, Conakry",
      },
      {
        nom: "Gentleman Horlogerie & Soie",
        email: "contact@gentleman-co.com",
        telephone: "+224622889900",
        adresse: "Centre Commercial Madina, Conakry",
      },
    ]);
    console.log(` ${fournisseurs.length} ateliers fournisseurs créés.`);
    const [fournisseurCostumes, fournisseurChemises, fournisseurMaroquinerie, fournisseurAccessoires] = fournisseurs;

    // 5. Clients de la boutique
    console.log("\n👥 5. Création des clients messieurs...");
    const clients = await clientModel.insertMany([
      {
        nom: "Diallo",
        prenom: "Thierno Amadou",
        email: "thierno.diallo@groupe-diallo.gn",
        telephone: "+224625112233",
        adresse: "Immeuble Almamya, Kaloum, Conakry",
      },
      {
        nom: "Cabinet d'Avocats Sow & Associés",
        prenom: "Direction Générale",
        email: "contact@sow-avocats.gn",
        telephone: "+224625445566",
        adresse: "Boulevard Maritime, Kaloum, Conakry",
      },
      {
        nom: "Camara",
        prenom: "Mohamed Lamine",
        email: "m.camara@consulting.com",
        telephone: "+224625778899",
        adresse: "Quartier Kipé, Ratoma, Conakry",
      },
      {
        nom: "Bah",
        prenom: "Ibrahima Sory",
        email: "ibrahima.bah@gmail.com",
        telephone: "+224625889900",
        adresse: "Lambanyi, Ratoma, Conakry",
      },
    ]);
    console.log(` ${clients.length} clients messieurs créés.`);
    const [clientThierno, clientCabinet, clientCamara, clientBah] = clients;

    // 6. Articles de mode masculine (Habits pour homme)
    console.log("\n 6. Création du catalogue d'articles de mode homme...");
    const articles = await articleModel.insertMany([
      {
        fournisseur_id: fournisseurCostumes._id,
        categorie_id: catCostumes._id,
        libelle: "Costume 3 Pièces Italien Slim Fit",
        description: "Laine Super 150s, veste ajustée 2 boutons, gilet assorti 5 boutons et pantalon sans pli",
        prixUnitaire: 3800000,
        quantiteEnStock: 12,
        seuilAlerte: 3,
        taille: "L",
        couleur: "Bleu Nuit",
        marque: "Sartoria Milano",
        image: "/uploads/costume_3pieces_bleu_nuit.webp",
      },
      {
        fournisseur_id: fournisseurCostumes._id,
        categorie_id: catCostumes._id,
        libelle: "Smoking de Cérémonie Col Châle Satiné",
        description: "Veste smoking noire avec revers châle en satin de soie, boutons recouverts et pantalon à galon",
        prixUnitaire: 4500000,
        quantiteEnStock: 8,
        seuilAlerte: 2,
        taille: "M",
        couleur: "Noir Intense",
        marque: "Sartoria Milano",
        image: "/uploads/smoking_ceremonie_noir.webp",
      },
      {
        fournisseur_id: fournisseurCostumes._id,
        categorie_id: catCostumes._id,
        libelle: "Blazer Croisé en Laine & Cachemire",
        description: "Veste croisée 6 boutons dorés gravés, coupe moderne déstructurée confortable",
        prixUnitaire: 2600000,
        quantiteEnStock: 15,
        seuilAlerte: 4,
        taille: "XL",
        couleur: "Gris Anthracite",
        marque: "Sartoria Milano",
        image: "/uploads/blazer_croise_gris.webp",
      },
      {
        fournisseur_id: fournisseurChemises._id,
        categorie_id: catChemises._id,
        libelle: "Chemise Popeline Blanche Col Italien",
        description: "100% Coton d'Égypte double retors 120s, tissage popeline doux et résistant au froissement",
        prixUnitaire: 650000,
        quantiteEnStock: 30,
        seuilAlerte: 5,
        taille: "41",
        couleur: "Blanc Pur",
        marque: "Ateliers Coton & Prestige",
        image: "/uploads/chemise_blanche_col_italien.webp",
      },
      {
        fournisseur_id: fournisseurChemises._id,
        categorie_id: catChemises._id,
        libelle: "Chemise Habillée Poignets Mousquetaires",
        description: "Chemise habillée bleu ciel pour boutons de manchette, col semi-italien rigide impeccable",
        prixUnitaire: 720000,
        quantiteEnStock: 20,
        seuilAlerte: 4,
        taille: "40",
        couleur: "Bleu Ciel",
        marque: "Ateliers Coton & Prestige",
        image: "/uploads/chemise_mousquetaire_ciel.webp",
      },
      {
        fournisseur_id: fournisseurChemises._id,
        categorie_id: catChemises._id,
        libelle: "Polo en Piqué de Coton Mercerisé",
        description: "Polo haut de gamme piqué fin, col chemise avec patte à 3 boutons en nacre véritable",
        prixUnitaire: 480000,
        quantiteEnStock: 25,
        seuilAlerte: 5,
        taille: "L",
        couleur: "Noir Carbone",
        marque: "Ateliers Coton & Prestige",
        image: "/uploads/polo_mercerise_noir.webp",
      },
      {
        fournisseur_id: fournisseurCostumes._id,
        categorie_id: catPantalons._id,
        libelle: "Pantalon de Costume Laine Vierge",
        description: "Pantalon habillé coupe fuselée à pinces, poches passepoilées et passants de ceinture renforcés",
        prixUnitaire: 950000,
        quantiteEnStock: 18,
        seuilAlerte: 4,
        taille: "42",
        couleur: "Bleu Nuit",
        marque: "Sartoria Milano",
        image: "/uploads/pantalon_costume_bleu.webp",
      },
      {
        fournisseur_id: fournisseurChemises._id,
        categorie_id: catPantalons._id,
        libelle: "Pantalon Chino Stretch Confort",
        description: "Chino en sergé de coton peigné et élasthanne, confort thermique optimal et coupe droite moderne",
        prixUnitaire: 550000,
        quantiteEnStock: 22,
        seuilAlerte: 4,
        taille: "42",
        couleur: "Beige Sable",
        marque: "Ateliers Coton & Prestige",
        image: "/uploads/chino_beige_sable.webp",
      },
      {
        fournisseur_id: fournisseurMaroquinerie._id,
        categorie_id: catChaussures._id,
        libelle: "Mocassins Penny Loafers Cuir Patiné",
        description: "Cuir de veau pleine fleur patiné main, semelle cousue Blake et première en cuir respirant",
        prixUnitaire: 1950000,
        quantiteEnStock: 10,
        seuilAlerte: 2,
        taille: "43",
        couleur: "Marron Havane",
        marque: "Bottiers d'Art",
        image: "/uploads/mocassins_penny_marron.webp",
      },
      {
        fournisseur_id: fournisseurMaroquinerie._id,
        categorie_id: catChaussures._id,
        libelle: "Richelieu One-Cut Cuir Glacé",
        description: "Souliers Richelieu taillés dans une seule pièce de cuir de veau français, élégance absolue",
        prixUnitaire: 2400000,
        quantiteEnStock: 9,
        seuilAlerte: 2,
        taille: "42",
        couleur: "Noir Ébène",
        marque: "Bottiers d'Art",
        image: "/uploads/richelieu_onecut_noir.webp",
      },
      {
        fournisseur_id: fournisseurMaroquinerie._id,
        categorie_id: catAccessoires._id,
        libelle: "Ceinture Réversible Cuir Pleine Fleur",
        description: "Ceinture en cuir italien réversible (Noir / Marron) avec boucle argentée brossée",
        prixUnitaire: 390000,
        quantiteEnStock: 35,
        seuilAlerte: 5,
        taille: "95cm",
        couleur: "Noir / Marron",
        marque: "Bottiers d'Art",
        image: "/uploads/ceinture_reversible_cuir.webp",
      },
      {
        fournisseur_id: fournisseurAccessoires._id,
        categorie_id: catAccessoires._id,
        libelle: "Coffret Cravate Soie & Boutons de Manchette",
        description: "Coffret cadeau comprenant cravate 8cm en soie jacquard de Côme, pochette assortie et boutons",
        prixUnitaire: 420000,
        quantiteEnStock: 1, // Exprès 1 unité pour déclencher l'alerte de stock (seuil = 3) !
        seuilAlerte: 3,
        taille: "Standard",
        couleur: "Bordeaux & Or",
        marque: "Gentleman Horlogerie & Soie",
        image: "/uploads/coffret_cravate_soie.webp",
      },
    ]);
    console.log(` ${articles.length} articles pour homme créés (dont 1 en alerte de stock).`);
    const [
      artCostume3P,
      artSmoking,
      artBlazer,
      artChemiseBlanche,
      artChemiseCiel,
      artPolo,
      artPantalonCostume,
      artChino,
      artMocassins,
      artRichelieu,
      artCeinture,
      artCoffret,
    ] = articles;

    // 7. Mouvements initiaux d'ouverture de stock
    console.log("\n📋 7. Enregistrement des mouvements de stock d'ouverture...");
    const initialMovements = articles.map((art) => ({
      article_id: art._id,
      user_id: adminUser._id,
      typeMouvement: "entrée",
      quantite: art.quantiteEnStock,
      motif: "Stock initial d'ouverture de la boutique de prêt-à-porter homme",
      dateMouvement: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    }));
    await mouvementStockModel.insertMany(initialMovements);
    console.log(` ${initialMovements.length} mouvements de stock d'ouverture enregistrés.`);

    // 8. Commande d'Approvisionnement (Achats Fournisseurs)
    console.log("\n 8. Commande de réapprovisionnement auprès de Sartoria Milano...");
    const achatDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    const achatTotal = 5 * 2800000 + 10 * 450000; // 5 Costumes à 2.8M + 10 Chemises à 450k = 18 500 000 GNF

    const achat = await achatModel.create({
      numeroAchat: "ACH-2026-HOMME-001",
      fournisseur_id: fournisseurCostumes._id,
      montantTotal: achatTotal,
      statut: "reçu",
      statutPaiement: "payé",
      user_id: gestionnaireUser._id,
      dateAchat: achatDate,
    });

    await ligneAchatModel.insertMany([
      {
        achat_id: achat._id,
        article_id: artCostume3P._id,
        quantite: 5,
        prixAchatUnitaire: 2800000,
        sousTotal: 14000000,
      },
      {
        achat_id: achat._id,
        article_id: artChemiseBlanche._id,
        quantite: 10,
        prixAchatUnitaire: 450000,
        sousTotal: 4500000,
      },
    ]);

    // Dépense Finances pour l'achat
    await financeModel.create({
      type: "dépense",
      categorie: "achat",
      montant: achatTotal,
      modePaiement: "virement",
      description: `Règlement Achat N° ${achat.numeroAchat} - Sartoria Milano Confection`,
      user_id: gestionnaireUser._id,
      achat_id: achat._id,
      dateTransaction: achatDate,
    });
    console.log(` Achat enregistré (${achatTotal.toLocaleString()} GNF) avec écriture dans Finances.`);

    // 9. Vente N° 1 : Tenue complète Mariage / Cérémonie (Payée en totalité)
    console.log("\n💰 9. Vente N°1 : Tenue complète cérémonie pour M. Thierno Diallo...");
    const venteDate1 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    // 1 Costume 3 pièces + 1 Chemise Mousquetaire + 1 Mocassins + 1 Ceinture
    const totalVente1 =
      artCostume3P.prixUnitaire +
      artChemiseCiel.prixUnitaire +
      artMocassins.prixUnitaire +
      artCeinture.prixUnitaire; // 3.8M + 720k + 1.95M + 390k = 6 860 000 GNF

    const vente1 = await venteModel.create({
      client_id: clientThierno._id,
      user_id: caissierUser._id,
      numeroFacture: "FAC-HOMME-2026-0001",
      montantTotal: totalVente1,
      statut: "payée",
      createdAt: venteDate1,
    });

    await ligneVenteModel.insertMany([
      {
        vente_id: vente1._id,
        article_id: artCostume3P._id,
        quantite: 1,
        prixUnitaire: artCostume3P.prixUnitaire,
        sousTotal: artCostume3P.prixUnitaire,
      },
      {
        vente_id: vente1._id,
        article_id: artChemiseCiel._id,
        quantite: 1,
        prixUnitaire: artChemiseCiel.prixUnitaire,
        sousTotal: artChemiseCiel.prixUnitaire,
      },
      {
        vente_id: vente1._id,
        article_id: artMocassins._id,
        quantite: 1,
        prixUnitaire: artMocassins.prixUnitaire,
        sousTotal: artMocassins.prixUnitaire,
      },
      {
        vente_id: vente1._id,
        article_id: artCeinture._id,
        quantite: 1,
        prixUnitaire: artCeinture.prixUnitaire,
        sousTotal: artCeinture.prixUnitaire,
      },
    ]);

    // Mouvements de stock pour la vente 1
    await mouvementStockModel.insertMany([
      {
        article_id: artCostume3P._id,
        user_id: caissierUser._id,
        typeMouvement: "sortie",
        quantite: 1,
        motif: `Vente N° ${vente1.numeroFacture}`,
        vente_id: vente1._id,
        dateMouvement: venteDate1,
      },
      {
        article_id: artChemiseCiel._id,
        user_id: caissierUser._id,
        typeMouvement: "sortie",
        quantite: 1,
        motif: `Vente N° ${vente1.numeroFacture}`,
        vente_id: vente1._id,
        dateMouvement: venteDate1,
      },
      {
        article_id: artMocassins._id,
        user_id: caissierUser._id,
        typeMouvement: "sortie",
        quantite: 1,
        motif: `Vente N° ${vente1.numeroFacture}`,
        vente_id: vente1._id,
        dateMouvement: venteDate1,
      },
      {
        article_id: artCeinture._id,
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
      client_id: clientThierno._id,
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

    // Recette Finances pour la vente 1
    await financeModel.create({
      type: "recette",
      categorie: "vente",
      montant: totalVente1,
      modePaiement: "virement",
      description: `Règlement Facture N° ${facture1.numeroFacture} - Thierno Amadou Diallo`,
      user_id: caissierUser._id,
      vente_id: vente1._id,
      facture_id: facture1._id,
      paiement_id: paiement1._id,
      dateTransaction: venteDate1,
    });
    console.log(` Vente 1 (${totalVente1.toLocaleString()} GNF) réglée par Virement avec Facture et Finances.`);

    // 10. Vente N° 2 : Vente d'un Smoking de Gala (Partiellement payée via Orange Money)
    console.log("\n💳 10. Vente N°2 : Smoking de Gala avec acompte Orange Money...");
    const venteDate2 = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const totalVente2 = artSmoking.prixUnitaire; // 4 500 000 GNF
    const acompte = 3000000;
    const resteAPayer = totalVente2 - acompte; // 1 500 000 GNF

    const vente2 = await venteModel.create({
      client_id: clientCamara._id,
      user_id: caissierUser._id,
      numeroFacture: "FAC-HOMME-2026-0002",
      montantTotal: totalVente2,
      statut: "en_attente",
      createdAt: venteDate2,
    });

    await ligneVenteModel.create({
      vente_id: vente2._id,
      article_id: artSmoking._id,
      quantite: 1,
      prixUnitaire: artSmoking.prixUnitaire,
      sousTotal: totalVente2,
    });

    await mouvementStockModel.create({
      article_id: artSmoking._id,
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
      client_id: clientCamara._id,
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
      description: `Acompte Facture N° ${facture2.numeroFacture} - Mohamed Lamine Camara`,
      user_id: caissierUser._id,
      vente_id: vente2._id,
      facture_id: facture2._id,
      paiement_id: paiement2._id,
      dateTransaction: venteDate2,
    });
    console.log(` Vente 2 (${totalVente2.toLocaleString()} GNF) : acompte ${acompte.toLocaleString()} GNF, solde restant ${resteAPayer.toLocaleString()} GNF.`);

    // 11. Charges d'exploitation du showroom de mode
    console.log("\n💵 11. Enregistrement des charges de la boutique dans Finances...");
    await financeModel.insertMany([
      {
        type: "dépense",
        categorie: "loyer",
        montant: 6000000,
        modePaiement: "virement",
        description: "Loyer mensuel Showroom & Boutique Homme Kaloum",
        user_id: adminUser._id,
        dateTransaction: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        type: "dépense",
        categorie: "charge",
        montant: 900000,
        modePaiement: "espèces",
        description: "Facture Électricité & Climatisation du magasin",
        user_id: gestionnaireUser._id,
        dateTransaction: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(" Charges d'exploitation de la boutique enregistrées.");

    console.log("\n==================================================");
    console.log("🎉 SEED BOUTIQUE HOMME TERMINÉ AVEC SUCCÈS !");
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
