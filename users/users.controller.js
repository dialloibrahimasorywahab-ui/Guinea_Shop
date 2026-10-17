import UserService from "./user.service.js";

class UserController {
  static createUser = async (req, res) => {
    try {
      const data = req.body;
      const result = await UserService.createUser(data);
      return res.status(201).json({
        success: true,
        data: result,
        message: "Utilisateur créé avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  static getAllUsers = async (req, res) => {
    try {
      const users = await UserService.getAllUsers();
      return res.status(200).json({ success: true, data: users });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  static getUserById = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
      }
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  static getUserByRole = async (req, res) => {
    try {
      const { role } = req.params;
      const users = await UserService.getUserByRole(role);
      return res.status(200).json({ success: true, data: users });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  static updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedUser = await UserService.updateUser(id, data);
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: "Utilisateur mis à jour avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  static deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedUser = await UserService.deleteUser(id);
      if (!deletedUser) {
        return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: deletedUser,
        message: "Utilisateur supprimé avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

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
      const result = await UserService.login(identifier, password);
      return res.status(200).json({
        success: true,
        data: result,
        message: "Connexion réussie",
      });
    } catch (error) {
      return res.status(401).json({ success: false, message: error.message });
    }
  };
}

export default UserController;
