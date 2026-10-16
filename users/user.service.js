import UserRepository from "./users.repository.js";
import userModel from "./models/users.models.js";
import GetAllUsersDto from "./dto/detail.dto.js";
import JwtUtils from "../common/utils/jwt.utils.js"
import bcrypt from "bcrypt"

class UserService {
  static createUser = async (data) => {
    // Vérifier si un utilisateur a déjà cet email
    const existingUser = await UserRepository.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error("Cet email est déjà utilisé");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await UserRepository.createUser({
      ...data,
      password: hashedPassword,
    });

    // Création du token de connexion
    const token = JwtUtils.generateAccessToken({ id: newUser._id, email: newUser.email, role: newUser.role });

    return { user: newUser, token };
  };

  // recuperation d'un utilisateur par son id 

  static getUserById = async (id) => {
    return await UserRepository.getUserById(id);
  };

  // recuperation de tous les utilisateurs 

  static getAllUsers = async () => {
    const users = await UserRepository.getAllUsers()
    return users.map(user => new GetAllUsersDto(user.id, user.nom, user.prenom, user.email, user.telephone, user.role))
  };

  // recuperation d'un utilisateur par son role 

  static getUserByRole = async (role) => {
    return await UserRepository.getUserByRole(role);
  };

  static updateUser = async (id, update) => {
    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }
    return await UserRepository.updateUser(id, update);
  };

  static deleteUser = async (id) => {
    return await UserRepository.deleteUser(id);
  };

  static deleteUserById = async (id) => {
    return await UserRepository.deleteUser(id);
  };

  // Declaration de la methode de login
  static login = async (email, password) => {
    const user = await UserRepository.getUserByEmail(email, true);
    // verification du login ou de l'email
    if (!user) {
      throw new Error("Email ou Mot de passe incorrecte ");
    }
    // verification du password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Email ou Mot de passe incorrecte ");
    }
    // Declaration du token
    const token = JwtUtils.generateAccessToken({ id: user.id, email: user.email });
    return { token };
  }
}

export default UserService;
