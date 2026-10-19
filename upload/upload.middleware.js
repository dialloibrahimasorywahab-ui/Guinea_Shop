import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Répertoire de stockage des fichiers téléversés
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Création récursive du dossier uploads s'il n'existe pas encore
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Extensions et MIME types strictement autorisés (S7 : SVG interdit pour risque XSS)
const MIME_EXTENSIONS_MAP = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
};

// Configuration du stockage disque avec Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  },
});

// Filtre de sécurité renforcé (vérifie le MIME et la concordance d'extension)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = MIME_EXTENSIONS_MAP[file.mimetype];

  if (allowedExtensions && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Type de fichier non autorisé. Formats acceptés : JPG, PNG, WEBP, PDF (les fichiers SVG et exécutables sont strictement interdits).`
      ),
      false
    );
  }
};

// Instance Multer configurée (Taille maximale : 5 Mo par fichier)
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Mo
    files: 5, // Maximum 5 fichiers simultanés
  },
});

export default upload;
