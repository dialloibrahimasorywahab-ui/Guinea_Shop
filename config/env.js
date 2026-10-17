const requisToujours = [
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_SECRET',
  'JWT_REFRESH_EXPIRES_IN',
];

/**
 * Valide les variables d'environnement indispensables avant tout démarrage
 */
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
    console.error('❌ Configuration d\'environnement invalide :\n - ' + erreurs.join('\n - '));
    process.exit(1);
  }
};

export default checkEnv;
