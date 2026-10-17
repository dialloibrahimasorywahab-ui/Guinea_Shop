# Guinea_Shop — Rapport d'analyse et plan de correction

*Établi le 17 octobre 2026 à partir de l'archive `Guinea_Shop-main.zip`.*
*Pile analysée : Node 22, Express 5.2.1, Mongoose 9.9.1, driver MongoDB 7.5.0, 16 modules, 87 routes.*

---

## 1. Comment lire ce document

| Section | Contenu |
|---|---|
| 2 | Résumé et priorités |
| 3 | Catalogue des 27 constats (avec fichiers concernés) |
| 4 | **Plan de travail par phases** (tâches, fichiers, critères d'acceptation) |
| 5 | Décisions métier à trancher avant certaines tâches |
| 6 | Matrice de tests (un test par bug) |
| 7 | Migration des données existantes |
| 8 | Ordre, dépendances et estimation |
| 9 | Checklist finale et limites de cette analyse |

**Colonne « Preuve »**

- **Testé** : exécuté sur le code du projet (tests A à G, détaillés en section 6).
- **Code** : établi par lecture du code, **non exécuté** (aucune base MongoDB n'était disponible).
- **Driver** : établi par lecture du code source du driver MongoDB installé.

**Extraits de code** : ce sont des propositions. Les 8 blocs complets ont passé `node --check`, et quatre ont en plus été **exécutés** sur le projet : `verifytoken` (4 cas), `config/env.js` (6 cas), la garde de `seed.js` (4 cas) et le middleware `validate` sous Express 5 (champs inconnus retirés, `query` fonctionnel, erreur 400). Le modèle `RefreshToken` a été chargé (index TTL présent). **Aucun bloc n'a été exécuté contre une vraie base MongoDB** : testez-les avant de les adopter. Les blocs marqués « extrait » sont des fragments à insérer dans un fichier existant ; ils n'ont pas été vérifiés, même pour la syntaxe.

**Tailles** : S ≈ moins de 2 h, M ≈ une demi-journée, L ≈ 1 à 2 jours. Ce sont des ordres de grandeur, à ajuster selon votre aisance.

---

## 2. Résumé et priorités

Le projet a une bonne base (architecture controller/service/repository, RBAC cohérent, bcrypt, validation Yup, intention de transactions ACID). Les problèmes se concentrent sur trois zones :

1. **Fiabilité des opérations multi-documents** (ventes, paiements, achats) : le repli « sans transaction » ne fonctionne pas, le stock est modifié par lecture-calcul-écriture, plusieurs routes contournent les services.
2. **Cohérence argent** (paiements, factures, finances) : pas de plafond de paiement, enums incompatibles entre modèles, journal financier désynchronisé.
3. **Accès et exploitation** : token expiré renvoyé en 403, refresh non révocable, `user_id` falsifiable, seed destructeur sans garde, variables d'environnement non vérifiées.

**Socle minimum avant toute mise en production** : Phase 0 (T0.1 à T0.3), Phase 1 complète, T2.2 à T2.4, T3.1, T3.4, T3.5, T5.1.

---

## 3. Catalogue des constats

### 3.1 Critiques (données et argent)

| ID | Constat | Fichiers | Preuve |
|---|---|---|---|
| C1 | Le `try/catch` autour de `startTransaction()` est du code mort : cette méthode ne lève jamais d'erreur sur un MongoDB isolé. Sur un MongoDB local classique (l'URL par défaut est `127.0.0.1:27017`), la première opération avec session échoue côté serveur ; sur replica set ou Atlas, le code fonctionne | `ventes/ventes.service.js`, `paiement/paiement.service.js` (×3), `Achats/achats.service.js` | Driver (effet serveur non exécuté) |
| C2 | Stock : mises à jour perdues et conflits non gérés. (a) Si un article figure deux fois dans une même vente ou un même achat, chaque ligne travaille sur sa propre copie et une mise à jour écrase l'autre. (b) Deux ventes simultanées sur le même article : le conflit d'écriture de la transaction remonte comme erreur 400, sans relance. (c) Les routes sans transaction (`POST /mouvements-stock`, `deleteVente`, `deleteAchat`, `PUT /articles/:id`) font lecture puis `save()` : deux appels simultanés perdent une mise à jour | `ventes.service.js`, `achats.service.js`, `mouvement_stock.service.js`, `articles.repositories.js` | Code |
| C3 | Aucun plafond de paiement : un paiement de 10 fois le montant est accepté (et `Math.max(0, …)` masque le dépassement). Un paiement est aussi accepté sur une vente `annulée`. Le contrôle « déjà payée » n'existe que dans `/factures/:id/payer` | `paiement/paiement.service.js`, `factures/factures.service.js` | Code |
| C4 | Le validateur et le modèle Paiement acceptent `espèce`, le modèle Finance le refuse : le paiement échoue après coup. Même problème de doublons pour `valide/validé`, `echoue/échoué`, `Mobile Money` | `paiement/*`, `Finances/models/finances.models.js` | **Testé (C)** |
| C5 | Finances désynchronisées : passer un paiement de `en_attente` à `validé` ne crée pas la recette ; le passer à `échoué` ne la retire pas ; supprimer une vente laisse paiements et recettes orphelins ; supprimer un achat laisse la dépense ; `DELETE /finances/:id` efface n'importe quelle écriture | `paiement.service.js`, `ventes.service.js`, `achats.service.js`, `Finances/*` | Code |
| C6 | `PUT /ventes/:id` : assignation de masse (`montantTotal`, `user_id` passent la validation). Passer le statut à `annulée` ne restaure pas le stock. Modifier ou supprimer un paiement fait repasser une vente `annulée` à `en_attente` | `ventes/ventes.validator.js`, `ventes.service.js`, `paiement.service.js`, `common/validator/validator.js` | **Testé (E)** + code |
| C7 | Routes qui contournent la logique métier : `POST` et `DELETE` sur `/ligne-ventes` et `/lignes-achats` modifient des lignes sans toucher stock, montant ni facture. `ligne_ventes` et `articles` n'importent pas `validate` (schémas existants mais non branchés). `PUT /articles/:id` peut changer `quantiteEnStock` sans mouvement de stock | `ligne_ventes/*`, `Ligne_achat/*`, `articles/articles.routes.js`, `articles.validator.js` | Code |
| C8 | Ajuster un stock à 0 : le validateur accepte, le modèle `MouvementStock` refuse (`quantite ≥ 1`). Dans le service, l'article est sauvegardé avant le mouvement : réponse 400, stock déjà à 0, aucune trace. L'ajustement enregistre aussi le nouveau total, pas l'écart | `stock/stock.service.js`, `Mouvement_stock/*` | **Testé (D)** + code |
| C9 | Achat `en_attente` puis `reçu` via `PUT` : le stock n'est jamais incrémenté. Passer `statutPaiement` à `payé` : aucune dépense enregistrée. Un paiement partiel fournisseur n'a aucun montant stocké. `deleteAchat` écrête le stock à 0 (`Math.max`) alors que le mouvement enregistre la quantité entière | `Achats/achats.service.js`, `achats.validator.js` | Code |

### 3.2 Sécurité

| ID | Constat | Fichiers | Preuve |
|---|---|---|---|
| S1 | Token expiré : réponse **403** au lieu de 401, sans code distinguant « expiré » de « invalide ». Le front ne sait pas qu'il doit appeler `/auth/refresh` | `common/middleware/verifytoken.js` | **Testé (B)** |
| S2 | Le refresh token n'est ni stocké ni révocable ; la « rotation » n'invalide pas l'ancien ; pas de logout | `auth/auth.service.js` | Code |
| S3 | `login` ne vérifie pas `isActive` (seul le refresh le fait) ; temps de réponse différent si l'utilisateur n'existe pas (énumération de comptes) ; toute erreur du login est renvoyée en 401 | `auth/auth.service.js`, `auth.controller.js` | Code |
| S4 | `user_id` pris dans le corps de la requête (`req.body.user_id \|\| req.user.id`) : un caissier peut attribuer une opération à un autre utilisateur | 7 contrôleurs : `ventes`, `paiement`, `factures`, `Achats`, `Finances`, `stock`, `Mouvement_stock` | Code |
| S5 | Sans `JWT_EXPIRES_IN`, le login plante avec « expiresIn should be… », renvoyé en 401. Aucun `.env.example`, aucune vérification au démarrage | `common/utils/jwt.utils.js`, `serveur.js` | **Testé (A)** |
| S6 | `GET /users/:id` ouvert à tout utilisateur connecté, y compris le rôle `client`. `GET /articles/*` aussi, avec fournisseur (téléphone, email) et stock | `users/users.routes.js`, `articles/*` | Code |
| S7 | `npm run seed` vide 13 collections sans garde d'environnement ni confirmation, puis crée un admin avec le mot de passe public `Password123!` | `scripts/seed.js` | Code |
| S8 | Pas de limitation de tentatives sur `/auth/login` ; CORS ouvert (`*`) par défaut ; CSP désactivée ; `err.message` renvoyé tel quel ; mot de passe minimum de 6 caractères | `app.js`, `auth/*`, `users.validator.js` | Code |
| S9 | `npm audit` : 17 vulnérabilités (7 high, 10 moderate), **toutes via `nodemon` 1.14.10** placé dans `dependencies`. Express, jsonwebtoken, mongoose, bcrypt, helmet, yup non touchés | `package.json` | **Testé** |

### 3.3 Fonctionnels et hygiène

| ID | Constat | Fichiers | Preuve |
|---|---|---|---|
| V1 | Swagger : 28 endpoints sur 87 non documentés (catégories, clients, fournisseurs, ligne-ventes, lignes-achats, `GET /stock`). Port par défaut 3000 dans `servers` alors que le serveur écoute sur 8000. `persistAuthorization` absent | `config/swagger.js`, routes concernées | **Testé (G)** |
| V2 | `valeurStock` calculée au prix de vente : aucun prix d'achat sur `Article` | `stock/stock.service.js`, `articles.models.js` | Code |
| V3 | `seuilAlerte \|\| 5` : un seuil à 0 devient 5 dans `/stock/etat`, alors que `/stock/alertes` et `/articles/alerte` utilisent 0 | `stock/stock.service.js` | Code |
| V4 | Doublons de valeurs d'enum (voir C4) : les regroupements par mode ou statut sont éclatés | modèles et validateurs | Code |
| V5 | `isActive` jamais vérifié à la vente ; suppressions définitives sans intégrité référentielle ; `deleteVente` saute silencieusement la restauration de stock si l'article n'existe plus | `ventes.service.js`, tous les `DELETE` | Code |
| V6 | `validate(schema, 'query')` plante sous Express 5 (`req.query` en lecture seule). Latent : aucune route ne l'utilise aujourd'hui | `common/validator/validator.js` | **Testé (F)** |
| V7 | Numéro de facture `Date.now()` + 4 chiffres aléatoires : non séquentiel, collision possible, erreur Mongo brute en cas de doublon | `ventes.service.js`, `achats.service.js` | Code |
| V8 | Réponses d'erreur incohérentes (`message` ou `error`), code 400 pour presque toute erreur, y compris interne | tous les contrôleurs | Code |
| V9 | Hygiène : `.gitignore` avec `node_module/` (faute) et doublons ; README vide ; login dupliqué et mort dans `users/user.service.js` ; `hashPassword` pbkdf2 inutilisé ; aucun test | divers | Code |

---

## 4. Plan de travail

**Règle de conduite** : une branche Git par phase (`fix/phase-1-transactions-stock`, etc.), des commits courts, et pour chaque bug **un test qui échoue avant et réussit après** (section 6).

### Phase 0 — Préparation

**T0.1 — Branche et sauvegarde (S)**
- `git checkout -b fix/phase-0-prep`
- Sauvegarde de la base existante : `mongodump --uri "<DB_URL>" --out ./backup-AAAA-MM-JJ`

**T0.2 — MongoDB en replica set pour le développement (S)** — corrige le terrain de C1
- Option A : un cluster gratuit Atlas (replica set par défaut).
- Option B : en local, `mongod --replSet rs0 --dbpath <dossier>` puis, une seule fois, `mongosh --eval "rs.initiate()"`, et `DB_URL=mongodb://127.0.0.1:27017/gh_maick?replicaSet=rs0`. Si la connexion échoue parce que le nom d'hôte du membre n'est pas résolu, ajoutez `&directConnection=true` (à vérifier sur votre machine).
- *Critère* : `db.hello().setName` renvoie `rs0` dans `mongosh`.

**T0.3 — `.env.example` (S)** — prépare S5
Créer `.env.example` (sans valeurs secrètes) :
```
PORT=8000
NODE_ENV=development
DB_URL=mongodb://127.0.0.1:27017/gh_maick?replicaSet=rs0
JWT_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```
Générer les secrets avec `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`, un différent pour chaque variable. Les durées 15m et 7d sont des valeurs courantes, pas une règle.

**T0.4 — Audit d'intégrité des données existantes (M)**
Vos bugs ont peut-être déjà corrompu des données. Avant de corriger, écrire un script **en lecture seule** (`scripts/audit-integrite.js`) qui compte :
- paiements dont `vente_id` n'existe plus ; recettes Finance dont `paiement_id` ou `vente_id` n'existe plus ;
- lignes de vente ou d'achat dont l'article ou le parent n'existe plus ;
- factures dont `montantPaye` ≠ somme des paiements `validé` de la vente ;
- ventes dont `montantTotal` ≠ somme des `sousTotal` de leurs lignes ;
- ventes `payée` dont la facture n'est pas `payée` (et inversement) ;
- articles dont `quantiteEnStock` est incohérent avec les mouvements (n'a de sens que si le stock initial a été saisi comme mouvement : à interpréter avec prudence) ;
- utilisateurs dont le mot de passe ne commence pas par `$2` (hash pbkdf2 historique, voir T6.6).
*Critère* : un rapport chiffré, conservé comme état « avant ».

**T0.5 — Socle de tests (L)**
- Outils proposés : `node:test` (intégré à Node), `supertest`, `mongodb-memory-server` en mode replica set (`MongoMemoryReplSet`). Le téléchargement du binaire `mongod` nécessite un accès Internet sur votre machine ; vérifiez les versions compatibles avec Mongoose 9 à l'installation.
- Remplacer `"test": "echo …"` par `"test": "node --test"`.
- **Écrire d'abord les tests rouges** de la section 6 pour C2, C3, C4, C6, C8, S1, S3, S4 : ils reproduisent les bugs et serviront de filet pour les phases suivantes.

---

### Phase 1 — Transactions et stock (C1, C2, C8, V3)

**T1.1 — Utilitaire de transaction (S)** — corrige C1
Remplace les 5 blocs `try { startTransaction } catch` dupliqués.

```js
// common/db/transaction.js
import mongoose from 'mongoose';

let transactionsSupported; // mis en cache après le premier appel

export const supportsTransactions = async () => {
  if (transactionsSupported !== undefined) return transactionsSupported;
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  // setName : replica set ; msg === 'isdbgrid' : cluster shardé (mongos)
  transactionsSupported = Boolean(hello.setName) || hello.msg === 'isdbgrid';
  return transactionsSupported;
};

/**
 * Exécute work(session) dans une transaction, avec relance automatique en cas
 * de conflit d'écriture. session vaut null si MongoDB est isolé : toléré
 * uniquement hors production.
 * Attention : withTransaction peut rappeler le callback plusieurs fois, il ne
 * doit donc produire aucun effet de bord hors base de données.
 */
export const runInTransaction = async (work) => {
  if (!(await supportsTransactions())) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MongoDB doit être un replica set (transactions requises)');
    }
    return work(null);
  }
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};
```
Sur de très vieilles versions de MongoDB (avant 4.4.2), la commande `hello` n'existe pas : utiliser `isMaster`.
*Critère* : sur replica set, une vente dont l'étape « facture » échoue (provoquée dans un test) ne laisse **aucun** changement de stock ni aucune ligne ; sur MongoDB isolé en production, le démarrage ou l'opération est refusé avec un message clair.

**T1.2 — Opérations de stock atomiques (S)** — corrige C2 (a, b, c)

```js
// extrait — articles/articles.repositories.js (à ajouter dans la classe)
// Décrément conditionnel : un seul aller-retour, impossible de passer sous 0
static decrementStock = async (id, quantite, session = null) =>
  articleModel.findOneAndUpdate(
    { _id: id, isActive: true, quantiteEnStock: { $gte: quantite } },
    { $inc: { quantiteEnStock: -quantite } },
    { new: true, ...(session ? { session } : {}) }
  );

static incrementStock = async (id, quantite, session = null) =>
  articleModel.findByIdAndUpdate(
    id,
    { $inc: { quantiteEnStock: quantite } },
    { new: true, ...(session ? { session } : {}) }
  );
```
- Ajouter `.integer()` aux quantités dans tous les schémas Yup (ventes, achats, mouvements, stock).
- *Critère* : 20 requêtes simultanées de 1 unité sur un stock de 10 → exactement 10 réussissent, stock final 0, 10 mouvements `sortie`.

**T1.3 — Refonte de `createVente` (M)** — corrige C1, C2, V5 (partiel)
- Envelopper dans `runInTransaction`.
- Regrouper les lignes par article avant tout traitement.
- Décrémenter via `decrementStock` ; le prix vient du document retourné par cette même opération.
- Vérifier que le client existe et est actif.
- Forcer `statut: 'en_attente'` (voir D2).

```js
// extrait — ventes/ventes.service.js
static createVente = async ({ client_id, user_id, items }) =>
  runInTransaction(async (session) => {
    // 1. Regrouper par article (évite la mise à jour perdue des lignes en double)
    const quantites = new Map();
    for (const { article_id, quantite } of items) {
      const cle = String(article_id);
      quantites.set(cle, (quantites.get(cle) || 0) + Number(quantite));
    }

    // 2. Décrément atomique ; le prix est lu sur le même document
    let montantTotal = 0;
    const lignes = [];
    for (const [articleId, quantite] of quantites) {
      const article = await ArticleRepository.decrementStock(articleId, quantite, session);
      if (!article) throw new ConflictError(`Stock insuffisant ou article inactif : ${articleId}`);
      const sousTotal = quantite * article.prixUnitaire;
      montantTotal += sousTotal;
      lignes.push({ article_id: article._id, quantite, prixUnitaire: article.prixUnitaire, sousTotal });
    }

    // 3. Créer la vente, les lignes, les mouvements 'sortie' et la facture
    //    (mêmes dépôts qu'aujourd'hui, avec la session) ...
  });
```
(`ConflictError` vient de T6.5 ; en attendant, utiliser `Error`.)

**T1.4 — Annulation de vente à la place de la suppression (M)** — corrige C2(c), C5, C6, V5 — **dépend de D1**
- Nouvelle action `POST /ventes/:id/annuler` dans une transaction : statut → `annulée`, `incrementStock` pour chaque ligne, mouvements `entrée` compensatoires, écriture de contrepartie si des paiements existent (voir T2.6).
- Refuser si la vente est déjà `annulée` (idempotence).
- Si un article n'existe plus : **échouer explicitement** au lieu de sauter (aujourd'hui `if (article)` masque le problème).
- Retirer ou verrouiller `DELETE /ventes/:id` (admin uniquement, et seulement pour une vente sans paiement ni facture, ou supprimer la route).

**T1.5 — Refonte de `createAchat` et de l'annulation d'achat (M)** — corrige C1, C2, C9
- `runInTransaction`, regroupement par article, `incrementStock` (si `reçu`).
- Annulation d'un achat reçu : `decrementStock` **sans écrêtage** ; si le stock est insuffisant (des articles ont déjà été vendus), refuser avec un message clair plutôt que de masquer l'écart.

**T1.6 — Mouvements et ajustements de stock (M)** — corrige C2(c), C8
- `MouvementStockService.createMouvement` : transaction + opérations atomiques de T1.2 (`sortie` via `decrementStock`).
- Ajustement : lire le stock courant dans la transaction, calculer l'écart, puis `findOneAndUpdate({ _id, quantiteEnStock: ancien }, { $set: { quantiteEnStock: nouveau } })` (concurrence optimiste : `null` → erreur de conflit).
- Modèle `MouvementStock` : ajouter `quantiteAvant` et `quantiteApres` ; pour un ajustement, `quantite = |écart|` ; refuser un écart nul (« aucun changement »). Cela permet d'ajuster à 0 et rend l'historique exploitable.
- *Critère* : ajuster à 0 → 200, stock 0, un mouvement avec avant/après ; si la création du mouvement échoue, le stock est **inchangé**.

**T1.7 — Seuil d'alerte (S)** — corrige V3
Dans `stock/stock.service.js`, remplacer `art.seuilAlerte || 5` par `art.seuilAlerte ?? 5` (deux occurrences).

---

### Phase 2 — Paiements, factures, finances (C3, C4, C5, C6, C9)

**Avant le code : exécuter la migration des enums (section 7).**

**T2.1 — Constantes partagées (S)** — corrige C4, V4
Créer `common/constants.js` : `MODES_PAIEMENT = ['espèces','carte','chèque','virement','mobile_money','autre']`, `STATUTS_PAIEMENT = ['validé','échoué','en_attente']`, et l'utiliser dans les modèles Paiement, Finance et dans tous les validateurs. Supprimer `espèce`, `Mobile Money`, `valide`, `echoue` et simplifier tous les filtres `p.statut === 'validé' || p.statut === 'valide'`. Le statut `credit` n'est pas géré par les validateurs : le supprimer ou le spécifier (voir D2).

**T2.2 — Contrôles et synchronisation dans `PaiementService` (M)** — corrige C3, C5
Dans une transaction (`runInTransaction`) :
- refuser si la vente est `annulée` ou la facture déjà `payée` ;
- pour un paiement `validé` : refuser si `montant > montantTotal − déjà payé` ;
- après create, update et delete, appeler une fonction unique de synchronisation :

```js
// extrait — paiement/paiement.service.js
// Invariant : une recette existe pour un paiement si et seulement s'il est 'validé'
static syncFinance = async (paiement, { user_id, description }, session) => {
  if (paiement.statut === 'validé') {
    return FinanceRepository.upsertByPaiementId(paiement._id, {
      type: 'recette',
      categorie: 'vente',
      montant: paiement.montant,
      modePaiement: paiement.modePaiement,
      vente_id: paiement.vente_id,
      user_id,
      description,
      dateTransaction: paiement.datePaiement,
    }, session);
  }
  return FinanceRepository.deleteTransactionsByPaiementId(paiement._id, session);
};
```
`upsertByPaiementId` est à ajouter au dépôt Finances : `findOneAndUpdate({ paiement_id }, { $set: data }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true, session })`.
Deux paiements simultanés sur la même vente écrivent tous deux la facture : le conflit d'écriture les sérialise et `withTransaction` relance le second, qui voit alors le total à jour.
- *Critère* : paiement à 150 % → 400 ; paiement sur vente annulée → 400 ; `en_attente` → `validé` crée **une** recette ; `validé` → `échoué` la retire ; `espèce` → 400 de validation.

**T2.3 — Machine à états du statut de vente (S)** — corrige C6
`en_attente → payée` (automatique quand le total validé atteint le montant), `payée → en_attente` (si un paiement est retiré), `annulée` **terminal**. Dans `updatePaiement` et `deletePaiement`, ne jamais recalculer le statut d'une vente `annulée`.

**T2.4 — Verrouiller `PUT /ventes/:id` (S)** — corrige C6
- Service : ne retenir explicitement que `client_id` (et uniquement tant qu'aucun paiement n'existe) ; ne **jamais** passer `req.body` à `findByIdAndUpdate`.
- `numeroFacture` devient immuable (le modifier casse le lien avec la facture).
- Le statut ne se change plus par `PUT` : il découle des paiements (T2.3) ou de l'action `annuler` (T1.4).
- À la création, ne plus accepter `statut` ni `numeroFacture` du client (voir D2).

**T2.5 — Workflow d'achat explicite (L)** — corrige C9 — **dépend de D11**
- Remplacer `PUT /achats/:id` (statuts libres) par des actions : `POST /achats/:id/recevoir` (`en_attente → reçu` : `incrementStock` + mouvement `entrée`, 409 si déjà reçu), `POST /achats/:id/payer` (`montant`, `modePaiement` : crée la dépense Finances), `POST /achats/:id/annuler`.
- Ajouter `montantPaye` au modèle `Achat` ; `statutPaiement` en découle (`impayé`, `partiellement_payé`, `payé`).
- Le mode de paiement de la dépense n'est plus codé en dur à `espèces`.

**T2.6 — Journal financier protégé (S à M)** — corrige C5 — **dépend de D1**
- `DELETE /finances/:id` : autorisé uniquement pour les écritures **manuelles** (sans `paiement_id`, `vente_id`, `achat_id`, `facture_id`) ; refusé (409) sinon.
- Les écritures liées à un paiement sont **dérivées** : seul `syncFinance` les modifie.
- Annulation d'une vente déjà payée : écriture de contrepartie (par exemple `dépense` de catégorie `remboursement`, à ajouter à l'enum) au lieu d'effacer la recette.

---

### Phase 3 — Accès et authentification (S1 à S6)

**T3.1 — Token expiré : 401 avec code (S)** — corrige S1
Remplace `common/middleware/verifytoken.js` (testé sur la copie de travail : token valide → `next()`, expiré → 401 `TOKEN_EXPIRED`, invalide → 401 `TOKEN_INVALID`, absent → 401 `TOKEN_MISSING`).

```js
// common/middleware/verifytoken.js
import JwtUtils from "../utils/jwt.utils.js";

const verifyAccessToken = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.replace(/^(Bearer\s+)+/i, '').trim();
  if (!token) {
    return res.status(401).json({ success: false, code: 'TOKEN_MISSING', message: 'Access token obligatoire' });
  }
  try {
    req.user = JwtUtils.verifyAccessToken(token);
    return next();
  } catch (err) {
    const expired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      code: expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
      message: expired ? 'Token expiré' : 'Token invalide',
    });
  }
};

export default verifyAccessToken;
```
Le 403 reste réservé à `authorize` (rôle insuffisant). Côté client : à la réception de `TOKEN_EXPIRED`, appeler `POST /auth/refresh`, puis rejouer la requête une seule fois. Ajouter les réponses 401 aux annotations Swagger.

**T3.2 — Login : `isActive`, énumération, codes d'erreur (S)** — corrige S3
- Refuser si `user.isActive === false` (vérifier le mot de passe **d'abord**, puis répondre « compte désactivé », pour ne pas révéler l'état d'un compte à qui n'a pas le bon mot de passe).
- Utilisateur introuvable : exécuter quand même un `bcrypt.compare` contre un hash factice pour égaliser le temps de réponse.
- Distinguer 401 (identifiants) de 500 (erreur interne) : voir T6.5.

**T3.3 — Refresh token révocable avec rotation (L)** — corrige S2 — **dépend de D4**
Principe : suivre l'**état** de chaque refresh token en base (son `jti`), sans stocker le token lui-même ; une fuite de la base ne donne donc aucun token utilisable.

```js
// auth/models/refreshToken.models.js
import { Schema, model } from 'mongoose';

const refreshTokenSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jti: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
  replacedBy: { type: String, default: null },
}, { timestamps: true });

// MongoDB supprime automatiquement les documents expirés
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model('RefreshToken', refreshTokenSchema);
```
Logique à implémenter :
1. **Login** : `jti = crypto.randomUUID()` ; `jwt.sign({ id }, secret, { expiresIn, jwtid: jti })` ; enregistrer `{ user_id, jti, expiresAt }`. (Adapter `jwt.utils.js` pour accepter `jwtid`.)
2. **Refresh** : vérifier la signature ; retrouver le document par `jti`. S'il n'existe pas ou est déjà révoqué : **réutilisation détectée** → révoquer tous les tokens de l'utilisateur → 401. Sinon : révoquer l'actuel (`replacedBy = nouveau jti`), vérifier `isActive`, émettre une nouvelle paire.
3. **Logout** (`POST /auth/logout`) : révoquer le `jti` courant.
4. Documenter ces endpoints dans Swagger.
Risque connu : deux requêtes de refresh simultanées (deux onglets) déclenchent la détection de réutilisation ; prévoir une courte tolérance ou accepter ce comportement.
*Critère* : réutiliser un refresh déjà consommé → 401 et plus aucun token de cet utilisateur ne fonctionne ; après logout, le refresh est refusé.

**T3.4 — `user_id` toujours issu du token (S)** — corrige S4
Dans les 7 contrôleurs, remplacer `req.body.user_id || req.user?.id` par `req.user.id`, et retirer `user_id` des schémas Yup (`createFinanceSchema`, `createMouvementStockSchema`, `ajusterStockSchema`).
*Critère* : un `POST` avec `user_id` d'un autre utilisateur enregistre l'identifiant du token.

**T3.5 — Vérification de l'environnement au démarrage (S)** — corrige S5

```js
// config/env.js
const requisToujours = ['JWT_SECRET', 'JWT_EXPIRES_IN', 'JWT_REFRESH_SECRET', 'JWT_REFRESH_EXPIRES_IN'];

export const checkEnv = () => {
  const erreurs = requisToujours
    .filter((k) => !process.env[k])
    .map((k) => `${k} est manquante`);

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    erreurs.push('JWT_SECRET doit faire au moins 32 caractères');
  }
  if (process.env.JWT_SECRET && process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
    erreurs.push('JWT_REFRESH_SECRET doit être différente de JWT_SECRET');
  }
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.DB_URL) erreurs.push('DB_URL est obligatoire en production');
    if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*') {
      erreurs.push('CORS_ORIGIN doit être défini (pas "*") en production');
    }
  }

  if (erreurs.length > 0) {
    console.error('Configuration invalide :\n - ' + erreurs.join('\n - '));
    process.exit(1);
  }
};
```
Appeler `checkEnv()` dans `serveur.js` juste après `import 'dotenv/config'`, avant `connectDB()`.
*Critère* : sans `JWT_EXPIRES_IN`, le processus s'arrête avec la liste des variables manquantes, au lieu de planter plus tard au login.

**T3.6 — Restreindre les lectures (M)** — corrige S6 — **dépend de D5**
- `GET /users/:id` : `admin` et `gestionnaire`, ou l'utilisateur lui-même (`req.user.id === req.params.id`).
- `GET /articles/*` pour le rôle `client` : réponse allégée (sans `fournisseur_id`, avec `disponible: true/false` plutôt que la quantité exacte).

---

### Phase 4 — Contournements et validation (C7, V6)

**T4.1 — Fermer les routes de lignes (S)** — corrige C7
- `ligne-ventes` et `lignes-achats` : conserver les `GET`, **supprimer** `POST` et `DELETE` (les lignes ne naissent et ne meurent qu'avec leur vente ou leur achat). Supprimer aussi `createLigneVente`, `deleteLigneVenteById` et équivalents devenus inutiles.
- *Critère* : `POST /ligne-ventes` → 404.

**T4.2 — Valider les articles et protéger le stock (S à M)** — corrige C7 — **dépend de D8**
- `articles.routes.js` : importer `validate` et brancher `createArticleSchema` / `updateArticleSchema`.
- Retirer `quantiteEnStock` de `updateArticleSchema` : le stock ne change que par mouvements.
- À la création, accepter un stock initial **uniquement** s'il génère un mouvement `entrée` « stock initial » dans la même transaction.
- Brancher aussi le schéma de `ligne_ventes.validators.js` s'il reste une route d'écriture, sinon le supprimer.

**T4.3 — Middleware `validate` (S)** — corrige C6, V6

```js
// common/validator/validator.js
const validate = (schema, source = 'body') => async (req, res, next) => {
  try {
    const validated = await schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true, // retire les champs non déclarés (assignation de masse)
    });
    // Express 5 : req.query est en lecture seule, on expose le résultat à part
    req.validated = { ...(req.validated || {}), [source]: validated };
    if (source === 'body') req.body = validated;
    return next();
  } catch (error) {
    const errors = error.inner && error.inner.length > 0
      ? error.inner.map((e) => ({ field: e.path, message: e.message }))
      : [{ message: error.message }];
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation des données transmises',
      errors,
    });
  }
};

export default validate;
```
Conséquence à tester : `stripUnknown: true` supprime silencieusement les champs non déclarés ; vérifier que chaque schéma déclare bien tous les champs légitimes. Les contrôleurs qui lisent `req.query` ou `req.params` après validation utilisent `req.validated.query` / `req.validated.params`.
*Critère* : `PUT /ventes/:id` avec `montantTotal` → le champ est ignoré ; `validate(schema, 'query')` fonctionne.

---

### Phase 5 — Durcissement et exploitation (S7, S8, S9)

**T5.1 — Garde du seed (S)** — corrige S7
Placer en tout début de `scripts/seed.js`, avant toute connexion :

```js
// scripts/seed.js
const url = process.env.DB_URL || 'mongodb://127.0.0.1:27017/gh_maick';
const estLocale = /(localhost|127\.0\.0\.1)/.test(url);

if (process.env.NODE_ENV === 'production') {
  console.error('Seed refusé en production : il vide 13 collections.');
  process.exit(1);
}
if (!estLocale && !process.argv.includes('--force')) {
  console.error('DB_URL ne pointe pas vers une base locale. Relancez avec --force si c\'est voulu.');
  process.exit(1);
}
```
Lire aussi le mot de passe du compte admin dans une variable (`SEED_ADMIN_PASSWORD`) plutôt que d'utiliser `Password123!` publié dans le dépôt. **Si ce seed a déjà été lancé sur une base réelle, changez immédiatement le mot de passe de tous les comptes concernés.**

**T5.2 — Durcissement HTTP (M)** — corrige S8
- Limitation de tentatives sur `/auth/login` et `/auth/refresh` avec `express-rate-limit` (vérifier la version et l'API à l'installation) ; ordre de grandeur courant : une dizaine de tentatives par quart d'heure et par IP.
- CORS : origine explicite en production (garanti par T3.5).
- `express.json({ limit: '100kb' })` explicite.
- CSP : réactiver pour toutes les routes sauf `/api-docs` (Swagger UI), ou configurer les directives nécessaires.
- Gestionnaire d'erreurs : en production, message générique pour les erreurs 5xx, détail dans les logs uniquement.
- Mot de passe : allonger le minimum (8 à 10 caractères) dans `users.validator.js` et le modèle.

**T5.3 — Dépendances (S)** — corrige S9
`npm uninstall nodemon` puis `npm install -D nodemon@latest` (le déplacer en `devDependencies`). Vérifier : `npm audit --omit=dev` ne doit plus signaler les 7 vulnérabilités « high ».

---

### Phase 6 — Documentation et qualité (V1, V2, V5, V7, V8, V9)

**T6.1 — Swagger complet et cohérent (L)** — corrige V1
- Documenter les 28 endpoints manquants (catégories, clients, fournisseurs, `GET /stock`, et les `GET` des lignes).
- `servers.url` : utiliser le **même** port par défaut que `serveur.js` (8000), depuis une configuration partagée.
- `swaggerOptions: { persistAuthorization: true }` pour conserver le token au rechargement.
- Ajouter un script de contrôle (`npm run check:swagger`) qui compare les routes Express aux chemins documentés et échoue en cas d'écart (c'est le test G de cette analyse, à industrialiser).

**T6.2 — Coût d'achat et valorisation du stock (M)** — corrige V2 — **dépend de D7**
Ajouter un coût à l'article, mis à jour à la réception d'un achat ; `valeurStock` = quantité × coût ; marge = prix de vente − coût. Prévoir une valeur de repli pour les articles existants sans coût.

**T6.3 — Intégrité référentielle et suppression douce (M)** — corrige V5
- Interdire (409) la suppression d'un article, client, fournisseur ou catégorie référencé ; proposer la désactivation (`isActive: false`) à la place.
- `decrementStock` filtre déjà `isActive: true` (T1.2) : un article désactivé ne se vend plus.

**T6.4 — Numérotation séquentielle (M)** — corrige V7 — **dépend de D6**

```js
// common/utils/counter.js
import mongoose from 'mongoose';

const Counter = mongoose.models.Counter
  || mongoose.model('Counter', new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } }));

export const nextNumber = async (name, session = null) => {
  const doc = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, ...(session ? { session } : {}) }
  );
  return doc.seq;
};
```
Usage : `FAC-${annee}-${String(seq).padStart(6, '0')}` avec le compteur `facture-${annee}`, **dans la transaction de création de la vente** (un échec annule aussi l'incrément, donc pas de trou ; en contrepartie les ventes se sérialisent sur ce document, acceptable à l'échelle d'une boutique). Créer les compteurs à l'initialisation pour éviter un conflit d'`upsert` au premier usage concurrent.

**T6.5 — Erreurs uniformes (L)** — corrige V8, S3
- `common/errors.js` : `AppError(status, message, code)`, `NotFoundError`, `ConflictError`, `ForbiddenError`, `ValidationError`.
- Les services lèvent ces erreurs ; les contrôleurs n'ont plus de `try/catch` (Express 5 transmet automatiquement les rejets de promesses aux middlewares d'erreur).
- Gestionnaire global : `AppError` → son statut ; erreur de validation Mongoose ou `CastError` → 400 ; clé dupliquée (code 11000) → 409 ; autre → 500 (message générique en production).
- Format unique : `{ success, message, code?, errors? }` (fin du mélange `message` / `error`).
- Migration progressive, module par module, tests verts à chaque étape.

**T6.6 — Hygiène (M)** — corrige V9
- `.gitignore` : corriger `node_module/`, retirer les doublons.
- README : installation, variables d'environnement, replica set, scripts, lancement des tests.
- Supprimer le code mort : `login` dupliqué dans `users/user.service.js`, `hashPassword` pbkdf2 et branche `':'` de `auth.service.js` **seulement si** l'audit T0.4 montre qu'aucun hash pbkdf2 n'existe en base (sinon migrer ces comptes d'abord). Cette branche appelle `crypto.timingSafeEqual`, qui lève une exception si les longueurs diffèrent.

---

### Phase 7 — Validation finale

**T7.1 — Contre-vérification (M)**
- Suite de tests complète verte ; chaque test de la section 6 rouge avant, vert après.
- Rejouer l'audit d'intégrité (T0.4) et comparer à l'état « avant ».
- `node --check` sur tous les fichiers, `npm audit --omit=dev`, `npm run check:swagger`.
- Parcours manuel dans Swagger : login → attendre l'expiration → recevoir `TOKEN_EXPIRED` → `/auth/refresh` → rejouer.

**T7.2 — Livraison (S)**
Ordre : sauvegarde → migration des données (section 7) → déploiement du code → vérification de santé (`/health`) → surveillance des logs. Étiqueter la version (`git tag`).

---

## 5. Décisions métier à trancher

| ID | Question | Recommandation | Bloque |
|---|---|---|---|
| D1 | Une vente annulée est-elle **supprimée** ou **marquée annulée** ? | Marquer annulée, avec écritures de contrepartie : l'historique comptable reste intact | T1.4, T2.6 |
| D2 | Le caissier peut-il enregistrer un paiement au moment de la vente ? Le statut `credit` est-il utilisé ? | Accepter un paiement optionnel dans le `POST /ventes` (traité par `PaiementService` dans la même transaction) ; supprimer `credit` sauf besoin réel | T1.3, T2.1, T2.4 |
| D3 | Monnaie : montants entiers (GNF) ou avec décimales ? | Si GNF sans subdivision : entiers (`.integer()` sur les montants). Sinon : stocker en plus petite unité pour éviter les erreurs d'arrondi des flottants | T2.2 |
| D4 | Qui consomme l'API (navigateur, application mobile) ? Où stocker le refresh token ? | Navigateur : cookie `httpOnly` ; mobile : stockage sécurisé du téléphone et transmission dans le corps. Je ne connais pas votre client : à confirmer | T3.3 |
| D5 | Les utilisateurs au rôle `client` se connectent-ils à l'API (e-commerce) ? Que voient-ils ? | Si oui : catalogue allégé sans fournisseur ni stock exact | T3.6 |
| D6 | Une numérotation de factures **continue et sans trou** est-elle exigée ? | À vérifier avec la réglementation et votre comptable ; la solution T6.4 la garantit | T6.4 |
| D7 | Valorisation du stock : dernier prix d'achat ou coût moyen pondéré ? | Dernier prix d'achat pour démarrer (plus simple) ; coût moyen pondéré si votre comptabilité l'exige | T6.2 |
| D8 | Un article créé avec du stock initial doit-il générer un mouvement ? | Oui : sinon l'historique des mouvements ne permet jamais de justifier le stock | T4.2 |
| D9 | Peut-on supprimer un mouvement de stock ? | Non : c'est un journal d'audit ; corriger par un mouvement inverse. Retirer `DELETE /mouvements-stock/:id` | T1.6 |
| D10 | Le mode « sans transaction » doit-il exister en développement ? | Seulement en développement, jamais en production (déjà prévu dans T1.1) ; idéalement l'éliminer avec T0.2 | T1.1 |
| D11 | Paiements partiels aux fournisseurs : à suivre ? | Oui, avec `montantPaye` sur l'achat et une dépense par versement | T2.5 |

---

## 6. Matrice de tests

| Bug | Scénario | Résultat attendu |
|---|---|---|
| C1 | Replica set : provoquer une erreur à l'étape « facture » d'une vente | Aucun changement de stock, aucune vente |
| C1 | MongoDB isolé, `NODE_ENV=production` | Opération refusée avec message explicite |
| C2 | 20 ventes simultanées de 1 unité, stock de 10 | Exactement 10 réussissent, stock 0 |
| C2 | Vente avec le même article en deux lignes (2 + 3) | Stock diminué de 5, une seule ligne regroupée |
| C3 | Paiement de 150 % du montant ; paiement sur vente annulée ; paiement sur facture payée via `POST /paiements` | 400 dans les trois cas |
| C4 | Paiement `espèce` ; paiement `espèces` | 400 de validation ; 201 avec une recette Finance |
| C5 | Paiement `en_attente` → `validé` ; `validé` → `échoué` | Une recette apparaît ; elle disparaît |
| C5 | Annuler une vente payée | Écriture de contrepartie, aucune suppression de recette |
| C6 | `PUT /ventes/:id` avec `montantTotal` | Champ ignoré |
| C6 | Modifier un paiement d'une vente `annulée` | La vente reste `annulée` |
| C7 | `POST /ligne-ventes` | 404 |
| C7 | `PUT /articles/:id` avec `quantiteEnStock` | Champ ignoré |
| C8 | `/stock/ajuster` à 0 | 200, stock 0, mouvement avec avant/après |
| C8 | Échec simulé à la création du mouvement | Stock inchangé |
| C9 | Recevoir un achat deux fois | Stock incrémenté une seule fois, second appel 409 |
| S1 | Token expiré ; token invalide ; rôle insuffisant | 401 `TOKEN_EXPIRED` ; 401 `TOKEN_INVALID` ; 403 |
| S2 | Réutiliser un refresh consommé ; refresh après logout | 401 et révocation générale ; 401 |
| S3 | Login d'un compte `isActive: false` | Refusé |
| S4 | `POST /ventes` avec `user_id` d'un autre | L'identifiant du token est enregistré |
| S5 | Démarrage sans `JWT_EXPIRES_IN` | Arrêt immédiat avec la liste des variables manquantes |
| S6 | Un `client` demande `GET /users/<autre id>` | 403 |
| S7 | `NODE_ENV=production npm run seed` | Sortie avec code 1, aucune suppression |
| S8 | 11 tentatives de login dans la fenêtre | 429 à partir de la limite |
| V1 | `npm run check:swagger` | Aucun écart |
| V3 | Article avec `seuilAlerte: 0` et stock 3 | Absent des deux listes d'alerte |
| V6 | `validate(schema, 'query')` | Fonctionne sous Express 5 |
| V7 | Deux ventes successives | Numéros consécutifs |

**Tests déjà exécutés dans cette analyse (A à G)** : A (JWT sans variables de durée), B (code HTTP du token expiré), C (enum `espèce` Paiement/Finance), D (ajustement à 0), E (assignation de masse sur `PUT /ventes`), F (`validate` sur `query` sous Express 5), G (comparaison Swagger / routes réelles : 87 routes, 59 endpoints documentés, 28 manquants).

---

## 7. Migration des données existantes

**Ordre** : sauvegarde (T0.1) → audit (T0.4) → migration → déploiement du code (Phase 2).

Noms de collections Mongoose réels : `users`, `categories`, `fournisseurs`, `clients`, `articles`, `ventes`, `ligneventes`, `factures`, `paiements`, `achats`, `ligneachats`, `mouvementstocks`, `finances`.

```js
// mongosh — normalisation des enums (à lancer AVANT le déploiement de T2.1)
db.paiements.updateMany({ modePaiement: 'espèce' },       { $set: { modePaiement: 'espèces' } });
db.paiements.updateMany({ modePaiement: 'Mobile Money' }, { $set: { modePaiement: 'mobile_money' } });
db.paiements.updateMany({ statut: 'valide' },             { $set: { statut: 'validé' } });
db.paiements.updateMany({ statut: 'echoue' },             { $set: { statut: 'échoué' } });
```

Vérification : `db.paiements.distinct('modePaiement')` et `db.paiements.distinct('statut')` ne doivent plus renvoyer que les valeurs canoniques. Pour la suite :
- **Données déjà incohérentes** (rapport T0.4) : décider cas par cas (recréer l'écriture manquante, supprimer l'orpheline) après sauvegarde ; ne pas les corriger en masse sans les avoir lues.
- **Nouveaux champs** (`quantiteAvant` / `quantiteApres`, `montantPaye` sur `Achat`, coût d'article) : prévoir des valeurs par défaut pour les documents existants.
- **Comptes pbkdf2** : si `db.users.countDocuments({ password: { $not: /^\$2/ } })` est supérieur à 0, conserver la branche de compatibilité du login ou forcer une réinitialisation de mot de passe.

---

## 8. Ordre, dépendances et estimation

```
Phase 0 (préparation)
   └─> Phase 1 (transactions, stock)
          └─> Phase 2 (paiements, finances)  <-- migration enums (section 7) avant
                 └─> Phase 4 (fermeture des contournements)
Phase 3 (accès, auth)        : indépendante, peut avancer en parallèle de la Phase 1
Phase 5 (durcissement)       : indépendante, après T0.3 et T3.5
Phase 6 (doc, qualité)       : après les Phases 1 à 4 (T6.1, T6.5 en dernier)
Phase 7 (validation)         : à la fin
```

| Phase | Tâches | Taille globale | Risque de régression |
|---|---|---|---|
| 0 | T0.1 à T0.5 | M à L | Faible |
| 1 | T1.1 à T1.7 | L | **Élevé** (cœur des ventes) |
| 2 | T2.1 à T2.6 | L | **Élevé** (argent, migration) |
| 3 | T3.1 à T3.6 | M à L | Moyen (le front doit gérer `TOKEN_EXPIRED`) |
| 4 | T4.1 à T4.3 | S à M | Moyen (`stripUnknown` peut retirer des champs attendus) |
| 5 | T5.1 à T5.3 | M | Faible |
| 6 | T6.1 à T6.6 | L | Moyen (T6.5 touche tous les contrôleurs) |
| 7 | T7.1, T7.2 | M | Faible |

**Ordre de grandeur total** : de l'ordre de 15 à 20 jours de travail effectif, avec une marge d'erreur d'environ 50 %. Les phases 1 à 3 représentent à peu près la moitié de l'effort et couvrent tous les constats critiques.

---

## 9. Checklist finale et limites de l'analyse

### Checklist

- [ ] Sauvegarde faite et restaurable
- [ ] MongoDB en replica set en développement et en production
- [ ] `.env` complet, secrets distincts d'au moins 32 caractères
- [ ] Audit d'intégrité avant / après comparé
- [ ] Migration des enums exécutée
- [ ] Tous les tests de la section 6 verts
- [ ] `npm audit --omit=dev` sans vulnérabilité « high »
- [ ] `npm run check:swagger` sans écart
- [ ] Seed impossible en production
- [ ] Front adapté à `TOKEN_EXPIRED` et au refresh
- [ ] Décisions D1 à D11 consignées dans le README

### Ce que cette analyse n'a pas pu vérifier

- **Aucune exécution contre MongoDB** : C1 (effet exact côté serveur), C2, C3, C5, C8 (ordre des opérations), C9 reposent sur la lecture du code ; je suis confiant sur la logique, mais aucun de ces comportements n'a été reproduit avec une base.
- Une correction par rapport au premier compte rendu : dans `createVente`, la transaction transforme la course entre deux ventes en **erreur de conflit non relancée** (C2-b), et non en survente ; la mise à jour perdue réelle vient des lignes en double (C2-a) et des routes sans transaction (C2-c).
- Les propositions de code n'ont subi que `node --check` ; `verifytoken` a en plus été testé sur le code du projet (4 cas).
- Non analysés : le fichier `analyse.drawio`, le contenu détaillé des annotations Swagger, le front-end éventuel, le déploiement.
- Les estimations de durée, les seuils de limitation de tentatives et les durées de tokens sont des ordres de grandeur, pas des mesures.
