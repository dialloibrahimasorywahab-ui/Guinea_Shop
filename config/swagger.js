import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GH_Maick ERP & Commercial Management API',
      version: '1.0.0',
      description: `
API RESTful complète pour la gestion commerciale et ERP **GH_Maick** :
- **Sécurité & Auth** : Authentification JWT, contrôle d'accès basé sur les rôles (RBAC : admin, gestionnaire, caissier, client).
- **Ventes & Facturation** : Gestion du panier, génération automatique de factures et traçabilité des stocks.
- **Paiements & Trésorerie** : Enregistrement atomique des paiements avec synchronisation immédiate des factures et du module **Finances**.
- **Achats & Approvisionnements** : Commandes fournisseurs, incrémentation automatique des stocks et décaissements en temps réel.
- **Stocks & Traçabilité** : Valorisation globale, alertes de rupture, et journal d'audit immuable des mouvements de stock.
      `,
      contact: {
        name: 'Équipe GH_Maick',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Serveur de Développement Local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Entrez votre token JWT sous la forme : Bearer <token>',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Message explicatif de l’erreur' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string', example: 'Opération effectuée avec succès' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66f0123456789abcdef01234' },
            login: { type: 'string', example: 'admin' },
            nom: { type: 'string', example: 'Diallo' },
            prenom: { type: 'string', example: 'Ibrahima' },
            email: { type: 'string', example: 'user@ghmaick.com' },
            telephone: { type: 'string', example: '+224620000000' },
            role: {
              type: 'string',
              enum: ['admin', 'gestionnaire', 'caissier', 'client'],
              example: 'admin',
            },
          },
        },
        Article: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66f0123456789abcdef01235' },
            codeArticle: { type: 'string', example: 'ART-1001' },
            libelle: { type: 'string', example: 'Ordinateur Portable HP' },
            prixUnitaire: { type: 'number', example: 4500000 },
            quantiteEnStock: { type: 'number', example: 15 },
            seuilAlerte: { type: 'number', example: 5 },
            categorie_id: { type: 'string', example: '66f0123456789abcdef01236' },
          },
        },
        Vente: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66f0123456789abcdef01237' },
            client_id: { type: 'string', example: '66f0123456789abcdef01238' },
            numeroFacture: { type: 'string', example: 'FAC-1729000000-1234' },
            montantTotal: { type: 'number', example: 9000000 },
            statut: {
              type: 'string',
              enum: ['en_attente', 'payée', 'annulée'],
              example: 'en_attente',
            },
          },
        },
        Facture: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66f0123456789abcdef01239' },
            vente_id: { type: 'string', example: '66f0123456789abcdef01237' },
            numeroFacture: { type: 'string', example: 'FAC-1729000000-1234' },
            client_id: { type: 'string', example: '66f0123456789abcdef01238' },
            montantTotal: { type: 'number', example: 9000000 },
            montantPaye: { type: 'number', example: 4500000 },
            montantRestant: { type: 'number', example: 4500000 },
            statut: {
              type: 'string',
              enum: ['impayée', 'partiellement_payée', 'payée'],
              example: 'partiellement_payée',
            },
          },
        },
        Paiement: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66f0123456789abcdef01240' },
            vente_id: { type: 'string', example: '66f0123456789abcdef01237' },
            montant: { type: 'number', example: 4500000 },
            modePaiement: {
              type: 'string',
              enum: ['espèces', 'carte', 'chèque', 'virement', 'mobile_money', 'autre'],
              example: 'mobile_money',
            },
            statut: {
              type: 'string',
              enum: ['validé', 'échoué', 'en_attente'],
              example: 'validé',
            },
            datePaiement: { type: 'string', format: 'date-time' },
          },
        },
        Finance: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66f0123456789abcdef01241' },
            type: { type: 'string', enum: ['recette', 'dépense'], example: 'recette' },
            categorie: {
              type: 'string',
              enum: ['vente', 'achat', 'salaire', 'loyer', 'charge', 'autre'],
              example: 'vente',
            },
            montant: { type: 'number', example: 4500000 },
            modePaiement: { type: 'string', example: 'mobile_money' },
            description: { type: 'string', example: 'Encaissement Vente / Facture N° FAC-...' },
            vente_id: { type: 'string' },
            facture_id: { type: 'string' },
            paiement_id: { type: 'string' },
            achat_id: { type: 'string' },
            dateTransaction: { type: 'string', format: 'date-time' },
          },
        },
        MouvementStock: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66f0123456789abcdef01242' },
            article_id: { type: 'string', example: '66f0123456789abcdef01235' },
            typeMouvement: {
              type: 'string',
              enum: ['entrée', 'sortie', 'ajustement'],
              example: 'entrée',
            },
            quantite: { type: 'number', example: 10 },
            motif: { type: 'string', example: 'Réception commande achat N° ACH-...' },
            dateMouvement: { type: 'string', format: 'date-time' },
          },
        },
        Achat: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66f0123456789abcdef01243' },
            fournisseur_id: { type: 'string', example: '66f0123456789abcdef01244' },
            numeroFactureFournisseur: { type: 'string', example: 'FF-2026-99' },
            montantTotal: { type: 'number', example: 12000000 },
            statut: {
              type: 'string',
              enum: ['commandé', 'reçu', 'annulé'],
              example: 'reçu',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Authentification', description: 'Connexion (Login), renouvellement de token (Refresh Token) et profil connecté' },
      { name: 'Utilisateurs', description: 'Gestion des comptes et des rôles RBAC' },
      { name: 'Articles', description: 'Catalogue des produits et gestion des prix' },
      { name: 'Catégories', description: 'Classification des articles' },
      { name: 'Clients', description: 'Répertoire et historique des clients' },
      { name: 'Fournisseurs', description: 'Partenaires fournisseurs d’approvisionnement' },
      { name: 'Ventes', description: 'Commandes, vente au comptoir et décrémentation de stock' },
      { name: 'Lignes de Vente', description: 'Détails des articles vendus par commande' },
      { name: 'Factures', description: 'Facturation client et suivi des soldes' },
      { name: 'Paiements', description: 'Règlements atomiques avec intégration en temps réel dans Finances' },
      { name: 'Achats', description: 'Réceptions fournisseurs, incrémentation de stock et décaissement' },
      { name: 'Lignes d\'Achat', description: 'Détails des articles achetés' },
      { name: 'Stock & Mouvements', description: 'Synthèse globale, valorisation du stock et audit des flux' },
      { name: 'Finances', description: 'Livre de trésorerie (recettes, dépenses) et bilan net' },
    ],
  },
  apis: [
    './app.js',
    './*/*.routes.js',
    './*/*.controller.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerSpec };

export const setupSwagger = (app) => {
  // Exposition de la documentation Swagger UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'GH_Maick API Docs',
    })
  );

  // Endpoint raw JSON de la spécification OpenAPI
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

export default setupSwagger;
