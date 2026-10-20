# 🇬🇳 Guinea Shop (GH_Maick) — API Backend ERP & Gestion Commerciale

API RESTful professionnelle conçue avec **Node.js 24**, **Express 5**, **Mongoose 9** et **MongoDB**.  
Système complet de gestion commerciale, stocks traçables, ventes et achats multi-articles, facturation, trésorerie et paiements adapté au contexte guinéen (devise **GNF**).

---

## 📋 Sommaire

- [Fonctionnalités Principales](#-fonctionnalités-principales)
- [Architecture Technique](#-architecture-technique)
- [Stack & Technologies](#-stack--technologies)
- [Prérequis](#-prérequis)
- [Installation & Démarrage Rapide](#-installation--démarrage-rapide)
- [Variables d'Environnement](#-variables-denvironnement)
- [Comptes par Défaut (Seeding)](#-comptes-par-défaut-seeding)
- [Documentation Interactive Swagger UI](#-documentation-interactive-swagger-ui)
- [Fonctionnalités Avancées de l'API](#-fonctionnalités-avancées-de-lapi)
  - [Upload d'Images Polymorphe](#1-upload-dimages-polymorphe-multipartform-data--json)
  - [Filtres, Recherche et Tri Dynamique](#2-filtres-recherche-et-tri-dynamique-sur-les-get)
- [Sécurité & Conformité](#-sécurité--conformité)
- [Tests & Scripts Utiles](#-tests--scripts-utiles)

---

## ✨ Fonctionnalités Principales

1. **🔐 Authentification & Rôles (RBAC)** :
   - Dual-token JWT : `accessToken` court (15m) + `refreshToken` avec rotation systématique (`jti`).
   - Révocation et blacklistage en base des refresh tokens lors de la déconnexion.
   - 4 rôles stricts : `admin`, `gestionnaire`, `caissier`, `client`.
   - Protection Rate Limiting sur les endpoints sensibles (`/auth/login`, `/auth/refresh`).

2. **👔 Catalogue & Articles** :
   - Gestion complète des articles (costumes, chemises, souliers, accessoires...).
   - Upload direct d'images (`JPG`, `PNG`, `WEBP`) avec validation MIME, extension et contrôle XSS (SVG banni).
   - Détection des articles sous le seuil d'alerte de stock.

3. **📦 Stocks & Mouvements (Traçabilité Stricte)** :
   - **Protection anti-fraude** : interdiction de modifier manuellement la `quantiteEnStock` via `PUT /articles/:id`.
   - Toutes les variations de stock passent obligatoirement par des mouvements audités (`entrée`, `sortie`, `ajustement`).
   - Décrémentation atomique sous condition de disponibilité (`quantiteEnStock >= quantite`).

4. **🛒 Ventes & Lignes de Vente (Transactions ACID)** :
   - Enregistrement atomique multi-articles sous session MongoDB.
   - Génération automatique des numéros de facture (`FAC-TIMESTAMP-XXXX`).
   - Annulation sécurisée de vente avec réintégration automatique des stocks vendus.

5. **🧾 Facturation & Règlements** :
   - Suivi des statuts : `impayée`, `partiellement_payée`, `payée`.
   - Multi-moyens de paiement guinéens : `espèces`, `orange_money`, `mtn_momo`, `virement`, `carte_bancaire`, `chèque`.
   - Synchronisation automatique et instantanée du solde restant.

6. **💼 Achats Fournisseurs** :
   - Approvisionnement avec intégration en stock et enregistrement des dépenses.
   - Annulation avec contrôle de disponibilité des stocks.

7. **💰 Finances & Trésorerie** :
   - Journal unifié des écritures financières (`recette` / `dépense`).
   - Consolidation automatique du bilan financier (`totalRecettes`, `totalDepenses`, `soldeNet`).

---

## 🏛 Architecture Technique

Le projet adopte une architecture modulaire en couches garantissant la séparation des responsabilités :

```text
GH_Maick/ (Monorepo)
├── backend/                  # API RESTful Express 5 & MongoDB (tous les modules)
│   ├── Achats/               # Commandes et réceptions fournisseurs
│   ├── articles/             # Catalogue produits, stock et upload photos
│   ├── auth/                 # Authentification JWT, refresh et sessions
│   ├── categories/           # Classification des articles
│   ├── clients/              # Fichier clients
│   ├── common/
│   │   ├── middleware/       # verifyToken, authorize, rateLimiter, errorHandler
│   │   ├── utils/            # apiFeatures (filtres/tri), counter, jwt.utils
│   │   └── validator/        # Middleware de validation Yup (Express 5)
│   ├── config/               # Connexion MongoDB, checkEnv, Swagger
│   ├── factures/             # Facturation et gestion des soldes
│   ├── Finances/             # Trésorerie, recettes, dépenses et bilan net
│   ├── fournisseur/          # Fichier fournisseurs
│   ├── Ligne_achat/          # Détail des lignes d'achats
│   ├── ligne_ventes/         # Lignes de détail des ventes
│   ├── Mouvement_stock/      # Journal d'audit des flux de stock
│   ├── paiement/             # Encaissements (Orange Money, MoMo, Espèces...)
│   ├── scripts/              # Seed, check-swagger, check-syntax, test-api
│   ├── stock/                # Synthèse d'inventaire global
│   ├── tests/                # Tests unitaires et d'intégration natifs Node.js
│   ├── upload/               # Middlewares Multer et stockage sécurisé
│   ├── uploads/              # Répertoire de stockage des fichiers téléversés
│   ├── users/                # Gestion des comptes et profils utilisateurs
│   ├── ventes/               # Gestion des ventes au comptoir (transactions ACID)
│   ├── app.js                # Configuration de l'application Express
│   ├── package.json          # Dépendances et scripts backend
│   └── serveur.js            # Point d'entrée avec Graceful Shutdown
├── frontend/                 # (À venir) Interface Web React / Vue / Vite
├── package.json              # Scripts racine de commande
└── README.md                 # Documentation globale du projet
```

---

## 🚀 Stack & Technologies

* **Moteur & Runtime** : [Node.js](https://nodejs.org/) (v24.x)
* **Framework Web** : [Express.js](https://expressjs.com/) v5.2 (dernière version majeure)
* **Base de Données & ODM** : [MongoDB](https://www.mongodb.com/) avec [Mongoose](https://mongoosejs.com/) v9.9
* **Sécurité & Hash** : `bcrypt`, `jsonwebtoken`, `helmet`, `cors`
* **Validation de Schéma** : `yup`
* **Téléversement de Médias** : `multer` (fichiers sécurisés JPG, PNG, WEBP, PDF)
* **Documentation** : `swagger-ui-express`, `swagger-jsdoc` (OpenAPI 3.0)

---

## 📦 Prérequis

- **Node.js** `>= 20.x` (recommandé : `v24.x`)
- **MongoDB** `>= 6.0` configuré en **Replica Set** (requis pour l'exécution des transactions ACID multi-documents `session.withTransaction`)
  > *Astuce locale* : `mongod --replSet rs0 --dbpath <chemin_db>` puis `rs.initiate()` dans `mongosh`.

---

## ⚙️ Installation & Démarrage Rapide

1. **Cloner le projet** et accéder au répertoire :
   ```bash
   git clone <url_du_depot>
   cd GH_Maick
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Créer le fichier d'environnement** :
   ```bash
   cp .env.example .env
   ```

4. **Initialiser la base de données (Seeding)** :
   ```bash
   npm run seed
   ```

5. **Démarrer l'application** :
   - Mode développement (avec rechargement automatique) :
     ```bash
     npm run dev
     ```
   - Mode production :
     ```bash
     npm start
     ```

Le serveur écoute par défaut sur **`http://localhost:8000`**.

---

## 🔐 Variables d'Environnement

Exemple de configuration dans le fichier `.env` :

```ini
PORT=8000
NODE_ENV=development
DB_URL=mongodb://127.0.0.1:27017/gh_maick?replicaSet=rs0
JWT_SECRET=votre_cle_secrete_jwt_robuste_au_moins_32_caracteres
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=votre_cle_secrete_refresh_au_moins_32_caracteres
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=*
```

---

## 👤 Comptes par Défaut (Seeding)

Après avoir exécuté `npm run seed`, les comptes suivants sont prêts à l'emploi :

| Rôle | Email | Mot de passe | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ghmaick.com` | `Password123!` | Accès total (utilisateurs, finances, stocks, configuration) |
| **Gestionnaire** | `gestionnaire@ghmaick.com` | `Password123!` | Gestion catalogue, achats, approvisionnements, inventaire |
| **Caissier** | `caissier@ghmaick.com` | `Password123!` | Création de ventes, encaissement de paiements, consultation |
| **Client** | `client@ghmaick.com` | `Password123!` | Consultation du catalogue et suivi de son profil personnel |

---

## 📚 Documentation Interactive Swagger UI

L'intégralité de l'API (69 endpoints répartis sur 16 modules) est documentée selon la norme **OpenAPI 3.0** :

* **Interface interactive Swagger UI** : [http://localhost:8000/api-docs](http://localhost:8000/api-docs)
* **Spécification JSON brute** : [http://localhost:8000/api-docs.json](http://localhost:8000/api-docs.json)

Pour tester directement les routes protégées dans Swagger UI :
1. Cliquez sur le bouton vert **`Authorize`** en haut à droite.
2. Connectez-vous via `POST /auth/login` pour récupérer un `accessToken`.
3. Renseignez la valeur du token dans le champ `Bearer <token>` ou `<token>`.

---

## 💡 Fonctionnalités Avancées de l'API

### 1. Upload d'Images Polymorphe (`multipart/form-data` & `JSON`)

Sur `POST /articles` et `PUT /articles/{id}`, vous pouvez envoyer :
- **Directement un fichier image** en choisissant le media type `multipart/form-data` dans Swagger ou votre frontend :
  - Champ `image` : fichier binaire (JPG, PNG, WEBP - max 5 Mo).
  - L'image est stockée dans `/uploads/` et son URL publique est automatiquement renseignée dans l'article.
- **Un objet JSON** (`application/json`) en fournissant une URL d'image déjà existante.
- Un endpoint dédié existe également : `POST /articles/{id}/image` pour modifier la photo d'un article à tout moment.

### 2. Filtres, Recherche et Tri Dynamique sur les GET

Tous les endpoints de liste (`/all`) intègrent des options de filtrage, recherche textuelle et tri :

| Module | Paramètres Query Supportés | Exemples de Requêtes |
| :--- | :--- | :--- |
| **Articles** | `nom`, `search`, `sortBy`, `order`, `categorie_id`, `fournisseur_id`, `taille`, `couleur`, `marque` | `GET /articles/all?nom=Costume`<br>`GET /articles/all?sortBy=prixUnitaire&order=asc`<br>`GET /articles/all?sortBy=quantiteEnStock&order=desc` |
| **Utilisateurs** | `role`, `search`, `sortBy`, `order` | `GET /users/all?role=client`<br>`GET /users/all?search=Diallo&sortBy=nom&order=asc` |
| **Ventes** | `statut`, `client_id`, `search`, `sortBy`, `order` | `GET /ventes/all?statut=payée&sortBy=montantTotal&order=desc` |
| **Factures** | `statut`, `client_id`, `search`, `sortBy`, `order` | `GET /factures/all?statut=impayée&sortBy=montantRestant&order=desc` |
| **Paiements** | `modePaiement`, `statut`, `vente_id`, `search`, `sortBy`, `order` | `GET /paiements/all?modePaiement=orange_money&sortBy=datePaiement&order=desc` |
| **Achats** | `statut`, `fournisseur_id`, `search`, `sortBy`, `order` | `GET /achats/all?statut=reçu&sortBy=dateAchat&order=desc` |
| **Finances** | `type`, `categorie`, `modePaiement`, `search`, `sortBy`, `order` | `GET /finances/all?type=recette&sortBy=montant&order=desc` |
| **Mouvements Stock** | `typeMouvement`, `article_id`, `search`, `sortBy`, `order` | `GET /mouvements-stock/all?typeMouvement=entrée&sortBy=dateMouvement&order=desc` |

---

## 🛡 Sécurité & Conformité

- **Audit Trail & Intégrité** : interdiction des suppressions brutes des ventes et factures ayant des paiements associés. Les annulations réajustent les stocks et les finances via des transactions garanties.
- **Protection contre l'assignation de masse** : validation stricte via Yup avec élimination automatique des champs non autorisés (`stripUnknown: true`).
- **Gestion Unifiée des Erreurs** : middleware global interceptant les erreurs de syntaxe JSON, les `CastError` MongoDB (IDs mal formés), les duplications uniques (code 11000) et les erreurs d'upload Multer.
- **Arrêt Propre (Graceful Shutdown)** : interception des signaux `SIGINT` et `SIGTERM` pour fermer proprement les connexions HTTP et MongoDB sans perte de données.

---

## 🧪 Tests & Scripts Utiles

```bash
# Lancer la suite complète de tests unitaires et d'intégration natifs Node.js
npm test

# Vérifier la complétude et validité de la documentation Swagger (69/69 routes)
npm run check:swagger

# Vérifier la syntaxe de tous les fichiers JavaScript du projet
node scripts/check-syntax.js

# Exécuter les tests fonctionnels de l'API de bout en bout
node scripts/test-api.js
```

---

## 📄 Licence

Ce projet est sous licence **ISC**. Développé pour la gestion commerciale et l'ERP **Guinea Shop (GH_Maick)**.