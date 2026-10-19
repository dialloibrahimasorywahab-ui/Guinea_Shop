import { AppError } from '../errors.js';

/**
 * Middleware centralisé de traitement des erreurs (T6.5, V8)
 */
export const errorHandler = (err, req, res, next) => {
  // 1. Erreur applicative identifiée (héritant de AppError)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  // 2. Erreur d'identifiant MongoDB mal formé (CastError)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Format d'identifiant invalide pour le champ '${err.path}' : ${err.value}`,
      code: 'INVALID_ID_FORMAT',
    });
  }

  // 3. Erreur de validation de schéma Mongoose
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation des données',
      code: 'VALIDATION_ERROR',
      errors: details,
    });
  }

  // 4. Erreur de contrainte d'unicité MongoDB (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'champ';
    const value = err.keyValue ? err.keyValue[field] : '';
    return res.status(409).json({
      success: false,
      message: `La valeur '${value}' pour le champ '${field}' existe déjà`,
      code: 'DUPLICATE_KEY_CONFLICT',
    });
  }

  // 5. Erreurs JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: err.name === 'TokenExpiredError' ? 'Token expiré' : 'Token invalide',
      code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
    });
  }

  // 6. Erreurs de téléversement de fichiers Multer (S7)
  if (err.name === 'MulterError' || (err.message && err.message.includes('Type de fichier non autorisé'))) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Erreur lors du téléversement du fichier',
      code: err.code || 'UPLOAD_ERROR',
    });
  }

  // 7. Erreur de syntaxe JSON dans le corps de requête (ex: payload mal formé)
  if ((err instanceof SyntaxError && err.status === 400 && 'body' in err) || err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Format JSON invalide dans le corps de la requête. Vérifiez les virgules, guillemets et nombres.',
      code: 'INVALID_JSON_BODY',
    });
  }

  // 7. Erreur interne non gérée (500)
  console.error('❌ Erreur serveur non gérée :', err);

  const isProd = process.env.NODE_ENV === 'production';
  return res.status(err.status || 500).json({
    success: false,
    message: isProd
      ? 'Une erreur interne inattendue est survenue'
      : err.message || 'Erreur interne du serveur',
    code: 'INTERNAL_SERVER_ERROR',
  });
};

export default errorHandler;
