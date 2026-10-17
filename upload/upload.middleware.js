import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Répertoire de stockage des fichiers téléversés
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Création récursive du dossier uploads s'il n'existe pas encore
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

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

// Filtre sur les types MIME autorisés (Images : jpeg, png, webp, gif, svg)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'application/pdf', // autorise également les factures/justificatifs PDF
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Type de fichier non autorisé (${file.mimetype}). Types acceptés : JPG, PNG, WEBP, GIF, SVG, PDF.`
      ),
      false
    );
  }
};

// Instance Multer configurée (Taille maximale : 10 Mo par fichier)
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 Mo
  },
});

export default upload;
