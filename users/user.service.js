import UserRepository from "./users.repository.js";
import GetAllUsersDto from "./dto/detail.dto.js";
import JwtUtils from "../common/utils/jwt.utils.js";
import bcrypt from "bcrypt";

class UserService {
  static createUser = async (data) => {
    // Vérifier si un utilisateur a déjà cet email
    const existingEmail = await UserRepository.getUserByEmail(data.email);
    if (existingEmail) {
      throw new Error("Cet email est déjà utilisé");
    }

    const loginIdentifier = data.login
      ? data.login.trim().toLowerCase()
      : data.email.split('@')[0].toLowerCase();

    // Vérifier si ce login est déjà pris
    const existingLogin = await UserRepository.getUserByLoginOrEmail(loginIdentifier);
    if (existingLogin) {
      throw new Error(`Le login "${loginIdentifier}" est déjà utilisé`);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await UserRepository.createUser({
      ...data,
      login: loginIdentifier,
      password: hashedPassword,
    });

    // Création du token de connexion
    const token = JwtUtils.generateAccessToken({
      id: newUser._id,
      login: newUser.login,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      user: {
        id: newUser._id,
        login: newUser.login,
        nom: newUser.nom,
        prenom: newUser.prenom,
        email: newUser.email,
        telephone: newUser.telephone,
        role: newUser.role,
      },
      token,
    };
  };

  static getUserById = async (id) => {
    return await UserRepository.getUserById(id);
  };

  static getAllUsers = async (queryParams = {}) => {
    const users = await UserRepository.getAllUsers(queryParams);
    return users.map(
      (user) =>
        new GetAllUsersDto(
          user._id,
          user.login || user.email.split('@')[0],
          user.nom,
          user.prenom,
          user.email,
          user.telephone,
          user.role
        )
    );
  };

  static getUserByRole = async (role) => {
    return await UserRepository.getUserByRole(role);
  };

  static updateUser = async (id, update) => {
    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }
    if (update.login) {
      update.login = update.login.trim().toLowerCase();
    }
    return await UserRepository.updateUser(id, update);
  };

  static deleteUser = async (id) => {
    return await UserRepository.deleteUser(id);
  };

  static deleteUserById = async (id) => {
    return await UserRepository.deleteUser(id);
  };

  // Authentification par login ou email
  static login = async (identifier, password) => {
    const user = await UserRepository.getUserByLoginOrEmail(identifier, true);
    if (!user) {
      throw new Error("Identifiant (login/email) ou mot de passe incorrect");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Identifiant (login/email) ou mot de passe incorrect");
    }

    const token = JwtUtils.generateAccessToken({
      id: user._id,
      login: user.login || user.email.split('@')[0],
      email: user.email,
      role: user.role,
    });

    return {
      token,
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
}

export default UserService;
