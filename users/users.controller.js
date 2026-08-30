import UserService from "./user.service.js";

class UserController {
  static createUser = async (req, res) => {
    try {
      const newUser = await UserService.createUser(req.body);
      return res.status(201).json({
        success: true,
        data: newUser,
        message: "Utilisateur créé avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getAllUsers = async (req, res) => {
    try {
      const users = await UserService.getAllUsers();
      return res.status(200).json({ success: true, data: users });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  static getUserById = async (req, res) => {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, error: "Utilisateur introuvable" });
      }
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static updateUser = async (req, res) => {
    try {
      const updatedUser = await UserService.updateUser(req.params.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: "Utilisateur introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: "Utilisateur mis à jour avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static deleteUser = async (req, res) => {
    try {
      const deletedUser = await UserService.deleteUserById(req.params.id);
      if (!deletedUser) {
        return res.status(404).json({ success: false, error: "Utilisateur introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: deletedUser,
        message: "Utilisateur supprimé avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getUserByRole = async (req, res) => {
    try {
      const { role } = req.params;
      const users = await UserService.getUserByRole(role);
      return res.status(200).json({ success: true, data: users });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };
}

export default UserController;

