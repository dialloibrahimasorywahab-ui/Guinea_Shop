import crypto from "crypto";
import bcrypt from "bcrypt";
import UserRepository from "../users/users.repository.js";
import JwtUtils from "../common/utils/jwt.utils.js";
import userModel from "../users/models/users.models.js";
import refreshTokenModel from "./models/refreshToken.models.js";

// Hash factice pour égaliser le temps de réponse en cas d'identifiant introuvable (S3)
const DUMMY_HASH = "$2b$10$e8wF5qKx4y3pXl5s1w6PzeXUqfE4V8N7c2Y6b1a3d5e7f9g1h3j5k";

class AuthService {
  /**
   * Authentification de l'utilisateur avec protection contre l'énumération de comptes
   * et émission d'un refresh token révocable et tracé (jti).
   */
  static login = async (identifier, password) => {
    const user = await UserRepository.getUserByLoginOrEmail(identifier, true);

    if (!user) {
      // Exécuter un bcrypt factice pour égaliser le temps de traitement
      await bcrypt.compare(password, DUMMY_HASH);
      throw new Error("Identifiant (login/email) ou mot de passe incorrect");
    }

    let isPasswordValid = false;
    if (user.password && user.password.startsWith("$2")) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else if (user.password && user.password.includes(":")) {
      isPasswordValid = userModel.comparePassword(password, user.password);
    } else {
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    if (!isPasswordValid) {
      throw new Error("Identifiant (login/email) ou mot de passe incorrect");
    }

    // Le mot de passe est bon : vérifier maintenant si le compte est actif
    if (user.isActive === false) {
      throw new Error("Ce compte a été désactivé par un administrateur");
    }

    const payload = {
      id: user._id,
      login: user.login || user.email.split("@")[0],
      email: user.email,
      role: user.role,
    };

    const accessToken = JwtUtils.generateAccessToken(payload);

    // Génération et enregistrement de l'état du Refresh Token (jti)
    const jti = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    await refreshTokenModel.create({
      user_id: user._id,
      jti,
      expiresAt,
    });

    const refreshToken = JwtUtils.generateRefreshToken({ id: user._id }, { jwtid: jti });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        login: user.login || user.email.split("@")[0],
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
      },
    };
  };

  /**
   * Renouvellement avec rotation stricte et détection de réutilisation de session (S2)
   */
  static refreshToken = async (refreshToken) => {
    if (!refreshToken) {
      throw new Error("Le refresh token est requis");
    }

    let decoded;
    try {
      decoded = JwtUtils.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new Error("Refresh token invalide ou expiré");
    }

    const jti = decoded.jti;
    if (!jti) {
      throw new Error("Jeton de rafraîchissement non conforme");
    }

    // Retrouver l'état du token en base
    const tokenDoc = await refreshTokenModel.findOne({ jti });

    // Si le token n'existe pas ou a DÉJÀ été révoqué : tentative de réutilisation détectée !
    if (!tokenDoc || tokenDoc.revokedAt) {
      // Mesure de sécurité : révocation globale de toutes les sessions actives de l'utilisateur
      await refreshTokenModel.updateMany(
        { user_id: decoded.id },
        { revokedAt: new Date() }
      );
      throw new Error("Tentative de réutilisation de session détectée. Vos accès ont été révoqués par sécurité.");
    }

    // Vérifier l'expiration temporelle
    if (tokenDoc.expiresAt < new Date()) {
      tokenDoc.revokedAt = new Date();
      await tokenDoc.save();
      throw new Error("Le refresh token a expiré");
    }

    // Vérifier que l'utilisateur est toujours valide et actif
    const user = await UserRepository.getUserById(decoded.id);
    if (!user || user.isActive === false) {
      throw new Error("Utilisateur introuvable ou compte désactivé");
    }

    // ROTATION : Révoquer l'ancien token et créer le nouveau
    const newJti = crypto.randomUUID();
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    tokenDoc.revokedAt = new Date();
    tokenDoc.replacedBy = newJti;
    await tokenDoc.save();

    await refreshTokenModel.create({
      user_id: user._id,
      jti: newJti,
      expiresAt: newExpiresAt,
    });

    const newAccessToken = JwtUtils.generateAccessToken({
      id: user._id,
      login: user.login || user.email.split("@")[0],
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = JwtUtils.generateRefreshToken({ id: user._id }, { jwtid: newJti });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  };

  /**
   * Déconnexion sécurisée (Logout) : révocation immédiate du refresh token (S2)
   */
  static logout = async (refreshToken) => {
    if (!refreshToken) return true;
    try {
      const decoded = JwtUtils.verifyRefreshToken(refreshToken);
      if (decoded && decoded.jti) {
        await refreshTokenModel.findOneAndUpdate(
          { jti: decoded.jti },
          { revokedAt: new Date() }
        );
      }
    } catch {
      // Ignorer si déjà expiré ou invalide
    }
    return true;
  };

  /**
   * Récupération du profil de l'utilisateur connecté
   */
  static getProfile = async (userId) => {
    return await UserRepository.getUserById(userId);
  };
}

export default AuthService;
