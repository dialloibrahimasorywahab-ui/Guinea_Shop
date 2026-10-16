/**
 * Middleware de contrôle d'accès basé sur les rôles (RBAC)
 * @param  {...string} allowedRoles - Liste des rôles autorisés ('admin', 'gestionnaire', 'caissier', 'client')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Accès refusé : utilisateur non authentifié",
      });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès interdit : rôle '${req.user.role}' insuffisant. Requis : [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
};

export default authorize;
