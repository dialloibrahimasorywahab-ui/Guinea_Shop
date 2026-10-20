import userModel from "./models/users.models.js";
import applyApiFeatures from "../common/utils/apiFeatures.js";

class UserRepository {
  static createUser = async (data) => {
    return await userModel.create(data);
  };

  static getUserById = async (id) => {
    return await userModel.findById(id);
  };

  static getAllUsers = async (queryParams = {}) => {
    const query = userModel.find();
    return await applyApiFeatures(query, queryParams, {
      searchFields: ['nom', 'prenom', 'login', 'email', 'telephone'],
      filterFields: ['role', 'login', 'email'],
      allowedSortFields: ['nom', 'prenom', 'login', 'email', 'role', 'createdAt'],
      defaultSort: { createdAt: -1 },
      aliases: { search: 'q' },
    });
  };

  static getUserByRole = async (role) => {
    return await userModel.find({ role });
  };

  static getUserByEmail = async (email, withPassword = false) => {
    const query = userModel.findOne({ email: email?.toLowerCase() });
    if (withPassword) {
      query.select('+password');
    }
    return await query;
  };

  static getUserByLoginOrEmail = async (identifier, withPassword = false) => {
    const raw = typeof identifier === 'object' && identifier !== null ? (identifier.login || identifier.email) : identifier;
    const cleaned = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
    const query = userModel.findOne({
      $or: [{ email: cleaned }, { login: cleaned }],
    });
    if (withPassword) {
      query.select('+password');
    }
    return await query;
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