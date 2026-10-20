import express from 'express';
import UploadController from './upload.controller.js';
import { upload } from './upload.middleware.js';
import verifyAccessToken from '../common/middleware/verifytoken.js';

const router = express.Router();

/**
 * @swagger
 * /uploads/single:
 *   post:
 *     summary: "Téléverser une image ou un fichier (ex: photo d'un costume, chaussure, justificatif)"
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: "Fichier image à téléverser (JPG, PNG, WEBP, PDF - max 10 Mo)"
 *     responses:
 *       201:
 *         description: Fichier téléversé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Fichier téléversé avec succès" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     filename: { type: string, example: "costume_bleu_nuit-1718000000.webp" }
 *                     originalName: { type: string, example: "costume_bleu.webp" }
 *                     mimetype: { type: string, example: "image/webp" }
 *                     size: { type: number, example: 450200 }
 *                     url: { type: string, example: "/uploads/costume_bleu_nuit-1718000000.webp" }
 *                     fullUrl: { type: string, example: "http://localhost:8000/uploads/costume_bleu_nuit-1718000000.webp" }
 *       400:
 *         description: Aucun fichier fourni ou format invalide
 *       401:
 *         description: Non authentifié
 */
router.post('/single', verifyAccessToken, upload.single('file'), UploadController.uploadSingle);

/**
 * @swagger
 * /uploads/multiple:
 *   post:
 *     summary: "Téléverser plusieurs images simultanément (ex: galerie de photos pour un article)"
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [files]
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Liste des fichiers images à téléverser (max 10 fichiers)"
 *     responses:
 *       201:
 *         description: Fichiers téléversés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "3 fichiers téléversés avec succès" }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       filename: { type: string }
 *                       url: { type: string }
 *                       fullUrl: { type: string }
 *       400:
 *         description: Aucun fichier fourni
 *       401:
 *         description: Non authentifié
 */
router.post('/multiple', verifyAccessToken, upload.array('files', 10), UploadController.uploadMultiple);

export default router;
