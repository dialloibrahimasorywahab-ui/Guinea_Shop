import express from "express";
import ArticleController from "./articles.controller.js";
import verifyAccessToken from "../common/middleware/verifytoken.js";
import authorize from "../common/middleware/authorize.js";
import validate from "../common/validator/validator.js";
import { upload } from "../upload/upload.middleware.js";
import { createArticleSchema, updateArticleSchema } from "./articles.validator.js";

const router = express.Router();

/**
 * @swagger
 * /articles/all:
 *   get:
 *     summary: Récupérer tous les articles
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Article' }
 *       401:
 *         description: Non authentifié ou token expiré
 */
router.get("/all", verifyAccessToken, ArticleController.getAllArticles);

/**
 * @swagger
 * /articles/alerte:
 *   get:
 *     summary: Articles en dessous du seuil d'alerte
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des articles en alerte
 */
router.get("/alerte", verifyAccessToken, authorize('admin', 'gestionnaire'), ArticleController.getArticlesEnAlerte);

/**
 * @swagger
 * /articles/fournisseur/{fournisseurId}:
 *   get:
 *     summary: Articles d'un fournisseur
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fournisseurId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Articles du fournisseur
 */
router.get("/fournisseur/:fournisseurId", verifyAccessToken, authorize('admin', 'gestionnaire', 'caissier'), ArticleController.getArticlesByFournisseur);

/**
 * @swagger
 * /articles/categorie/{categorieId}:
 *   get:
 *     summary: Articles d'une catégorie
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categorieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Articles de la catégorie
 */
router.get("/categorie/:categorieId", verifyAccessToken, ArticleController.getArticlesByCategorie);

/**
 * @swagger
 * /articles/{id}:
 *   get:
 *     summary: Détails d'un article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'article
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Article' }
 *       401:
 *         description: Non authentifié ou token expiré
 *       404:
 *         description: Article introuvable
 *   put:
 *     summary: Modifier un article (Admin et Gestionnaire) - Support JSON ou Envoi direct de photo
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               libelle: { type: string, example: "Costume 3 pièces Slim Fit Italien" }
 *               description: { type: string, example: "Laine Super 150s, coupe ajustée, doublure satin" }
 *               prixUnitaire: { type: number, example: 2850000 }
 *               seuilAlerte: { type: number, example: 5 }
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "Fichier photo du vêtement (JPG, PNG, WEBP - max 5 Mo)"
 *               taille: { type: string, example: "L" }
 *               couleur: { type: string, example: "Bleu Nuit" }
 *               marque: { type: string, example: "Sartoria Milano" }
 *               categorie_id: { type: string, example: "" }
 *               fournisseur_id: { type: string, example: "" }
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               libelle: { type: string, example: "Costume 3 pièces Slim Fit Italien" }
 *               description: { type: string, example: "Laine Super 150s, coupe ajustée, doublure satin" }
 *               prixUnitaire: { type: number, example: 2850000 }
 *               quantiteEnStock: { type: number, example: 10 }
 *               seuilAlerte: { type: number, example: 5 }
 *               image: { type: string, example: "/uploads/costume.webp" }
 *               taille: { type: string, example: "L" }
 *               couleur: { type: string, example: "Bleu Nuit" }
 *               marque: { type: string, example: "Sartoria Milano" }
 *               categorie_id: { type: string, example: "" }
 *               fournisseur_id: { type: string, example: "" }
 *     responses:
 *       200:
 *         description: Article mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Article mis à jour avec succès" }
 *                 data: { $ref: '#/components/schemas/Article' }
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié ou token expiré
 *       403:
 *         description: Accès refusé (Réservé aux administrateurs et gestionnaires)
 *       404:
 *         description: Article introuvable
 *   delete:
 *     summary: Supprimer un article (Admin uniquement)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article supprimé
 */
router.get("/:id", verifyAccessToken, ArticleController.getArticleById);

// Middleware polymorphe : traite l'upload si multipart/form-data, ou passe directement si JSON
const handleArticleMedia = (req, res, next) => {
  if (req.is('multipart/form-data')) {
    return upload.single('image')(req, res, (err) => {
      if (err) return next(err);
      if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
      }
      next();
    });
  }
  next();
};

/**
 * @swagger
 * /articles:
 *   post:
 *     summary: "Créer un nouvel article (JSON ou Envoi direct de photo)"
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [libelle, prixUnitaire]
 *             properties:
 *               libelle: { type: string, example: "Costume 3 pièces Slim Fit Italien" }
 *               description: { type: string, example: "Laine Super 150s, coupe ajustée, doublure satin" }
 *               prixUnitaire: { type: number, example: 2850000 }
 *               quantiteEnStock: { type: number, example: 10 }
 *               seuilAlerte: { type: number, example: 5 }
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "Fichier photo du vêtement (JPG, PNG, WEBP - max 5 Mo)"
 *               taille: { type: string, example: "L" }
 *               couleur: { type: string, example: "Bleu Nuit" }
 *               marque: { type: string, example: "Sartoria Milano" }
 *               categorie_id: { type: string, example: "" }
 *               fournisseur_id: { type: string, example: "" }
 *         application/json:
 *           schema:
 *             type: object
 *             required: [libelle, prixUnitaire]
 *             properties:
 *               libelle: { type: string, example: "Costume 3 pièces Slim Fit Italien" }
 *               description: { type: string, example: "Laine Super 150s, coupe ajustée, doublure satin" }
 *               prixUnitaire: { type: number, example: 2850000 }
 *               quantiteEnStock: { type: number, example: 10 }
 *               seuilAlerte: { type: number, example: 5 }
 *               image: { type: string, example: "/uploads/costume.webp" }
 *               taille: { type: string, example: "L" }
 *               couleur: { type: string, example: "Bleu Nuit" }
 *               marque: { type: string, example: "Sartoria Milano" }
 *               categorie_id: { type: string, example: "" }
 *               fournisseur_id: { type: string, example: "" }
 *     responses:
 *       201:
 *         description: Article créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Article créé avec succès" }
 *                 data: { $ref: '#/components/schemas/Article' }
 *       400:
 *         description: Données invalides ou format incorrect
 *       401:
 *         description: Non authentifié ou token expiré
 *       403:
 *         description: Accès refusé (Réservé aux administrateurs et gestionnaires)
 */
router.post(
  "/",
  verifyAccessToken,
  authorize('admin', 'gestionnaire'),
  handleArticleMedia,
  validate(createArticleSchema),
  ArticleController.createArticle
);

router.put(
  "/:id",
  verifyAccessToken,
  authorize('admin', 'gestionnaire'),
  handleArticleMedia,
  validate(updateArticleSchema),
  ArticleController.updateArticle
);

/**
 * @swagger
 * /articles/{id}/image:
 *   post:
 *     summary: "Téléverser et associer une photo à un article (Admin ou Gestionnaire)"
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "Fichier photo du vêtement (JPG, PNG, WEBP - max 5 Mo)"
 *     responses:
 *       200:
 *         description: Image de l'article mise à jour avec succès
 *       400:
 *         description: Format invalide ou fichier manquant
 *       404:
 *         description: Article introuvable
 */
router.post(
  "/:id/image",
  verifyAccessToken,
  authorize('admin', 'gestionnaire'),
  upload.single('image'),
  ArticleController.uploadImage
);

router.delete("/:id", verifyAccessToken, authorize('admin'), ArticleController.deleteArticle);

export default router;
