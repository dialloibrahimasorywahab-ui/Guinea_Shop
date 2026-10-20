/**
 * Middleware de limitation de débit (Rate Limiting) in-memory sans dépendance externe
 * Prévient les attaques par force brute sur l'authentification et les abus d'API.
 */
export const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes par défaut
  const max = options.max || 10; // 10 requêtes par fenêtre par défaut
  const message = options.message || {
    success: false,
    error: "Trop de tentatives. Veuillez réessayer plus tard.",
    code: "RATE_LIMIT_EXCEEDED",
  };

  const hits = new Map();

  // Nettoyage périodique pour éviter toute fuite de mémoire
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, Math.min(windowMs, 60000)).unref();

  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    const key = `${ip}:${req.baseUrl || req.path}`;
    const now = Date.now();

    let record = hits.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      hits.set(key, record);
    } else {
      record.count += 1;
    }

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      return res.status(429).json(message);
    }

    next();
  };
};

export default createRateLimiter;
