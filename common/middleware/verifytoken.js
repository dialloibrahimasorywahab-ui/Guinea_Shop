import JwtUtils from "../utils/jwt.utils.js";

const verifyAccessToken = (req, res, next) => {
  const header = req.headers.authorization || '';
  // Tolère les préfixes Bearer répétés ou simples et les espaces
  const token = header.replace(/^(Bearer\s+)+/i, '').trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      code: 'TOKEN_MISSING',
      message: 'Access token obligatoire',
    });
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