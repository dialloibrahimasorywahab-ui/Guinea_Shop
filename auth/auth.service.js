import UserRepository from "../users/users.repository.js";
import JwtUtils from "../common/utils/jwt.utils.js";
import bcrypt from "bcrypt";

import userModel from "../users/models/users.models.js";

class AuthService {
  /**
   * Authentification de l'utilisateur via login ou email
   */
  static login = async (identifier, password) => {
    const user = await UserRepository.getUserByLoginOrEmail(identifier, true);
    if (!user) {
      throw new Error("Identifiant (login/email) ou mot de passe incorrect");
    }

    let isPasswordValid = false;
    if (user.password && user.password.startsWith('$2')) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else if (user.password && user.password.includes(':')) {
      isPasswordValid = userModel.comparePassword(password, user.password);
    } else {
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    if (!isPasswordValid) {
      throw new Error("Identifiant (login/email) ou mot de passe incorrect");
    }

    const payload = {
      id: user._id,
      login: user.login || user.email.split('@')[0],
      email: user.email,
      role: user.role,
    };

    const accessToken = JwtUtils.generateAccessToken(payload);
    const refreshToken = JwtUtils.generateRefreshToken({ id: user._id });

    return {
      accessToken,
      refreshToken,
      token: accessToken,
      user: {
        id: user._id,
        login: user.login || user.email.split('@')[0],
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
      },
    };
  };

  /**
   * Renouvellement de l'access token via le refresh token
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

    const user = await UserRepository.getUserById(decoded.id);
    if (!user || user.isActive === false) {
      throw new Error("Utilisateur introuvable ou compte désactivé");
    }

    const newAccessToken = JwtUtils.generateAccessToken({
      id: user._id,
      login: user.login || user.email.split('@')[0],
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = JwtUtils.generateRefreshToken({
      id: user._id,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      token: newAccessToken,
    };
  };

  /**
   * Récupération du profil de l'utilisateur connecté
   */
  static getProfile = async (userId) => {
    return await UserRepository.getUserById(userId);
  };
}

export default AuthService;
