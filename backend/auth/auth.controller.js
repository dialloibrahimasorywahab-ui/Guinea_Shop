import AuthService from "./auth.service.js";

class AuthController {
  /**
   * Connexion utilisateur (génération du token JWT)
   */
  static login = async (req, res) => {
    try {
      const identifier = req.body.login || req.body.email;
      const { password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          message: "Le login (ou email) et le mot de passe sont obligatoires",
        });
      }

      const result = await AuthService.login(identifier, password);
      return res.status(200).json({
        success: true,
        data: result,
        message: "Connexion réussie",
      });
    } catch (error) {
      return res.status(401).json({ success: false, message: error.message });
    }
  };

  /**
   * Rafraîchissement du token d'accès via refreshToken
   */
  static refreshToken = async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Le refresh token est obligatoire",
        });
      }

      const tokens = await AuthService.refreshToken(refreshToken);
      return res.status(200).json({
        success: true,
        data: tokens,
        message: "Token rafraîchi avec succès",
      });
    } catch (error) {
      return res.status(401).json({ success: false, message: error.message });
    }
  };

  /**
   * Consultation du profil de l'utilisateur actuellement connecté
   */
  static me = async (req, res) => {
    try {
      const user = await AuthService.getProfile(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
      }
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * Déconnexion (révocation du refresh token)
   */
  static logout = async (req, res) => {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);
      return res.status(200).json({
        success: true,
        message: "Déconnexion réussie (session révoquée)",
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
}

export default AuthController;
