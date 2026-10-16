import JwtUtils from "../utils/jwt.utils.js";

const verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Access token est obligatoire" });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    if (!token) {
        return res.status(401).json({ message: "Token manquant ou mal formaté" });
    }

    try {
        const decoded = JwtUtils.verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token d'accès invalide ou expiré" });
    }
};

export default verifyAccessToken;