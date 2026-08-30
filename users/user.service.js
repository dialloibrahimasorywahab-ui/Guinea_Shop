import UserRepository from "./users.repository.js";
import userModel from "./models/users.models.js";

class UserService {
  static createUser = async (data) => {
    if (data.password) {
      data.password = userModel.hashPassword(data.password);
    }
    return await UserRepository.createUser(data);
  };

  static getUserById = async (id) => {
    return await UserRepository.getUserById(id);
  };

  static getAllUsers = async () => {
    return await UserRepository.getAllUsers();
  };

  static getUserByRole = async (role) => {
    return await UserRepository.getUserByRole(role);
  };

  static updateUser = async (id, update) => {
    if (update.password) {
      update.password = userModel.hashPassword(update.password);
    }
    return await UserRepository.updateUser(id, update);
  };

  static deleteUser = async (id) => {
    return await UserRepository.deleteUser(id);
  };

  static deleteUserById = async (id) => {
    return await UserRepository.deleteUser(id);
  };
}

export default UserService;