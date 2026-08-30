import userModel from "./models/users.models.js";

class UserRepository {
  static createUser = async (data) => {
    return await userModel.create(data);
  };

  static getUserById = async (id) => {
    return await userModel.findById(id);
  };

  static getAllUsers = async () => {
    return await userModel.find();
  };

  static getUserByRole = async (role) => {
    return await userModel.find({ role });
  };

  static getUserByEmail = async (email) => {
    return await userModel.findOne({ email });
  };

  static updateUser = async (id, update) => {
    return await userModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
  };

  static deleteUser = async (id) => {
    return await userModel.findByIdAndDelete(id);
  };
}

export default UserRepository;