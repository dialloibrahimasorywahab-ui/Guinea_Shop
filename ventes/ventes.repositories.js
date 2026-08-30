import venteModel from "./models/ventes.models.js";

class VenteRepository {
  static createVente = async (data) => {
    return await venteModel.create(data);
  };

  static getVenteById = async (id) => {
    return await venteModel.findById(id).populate('client_id').populate('user_id');
  };

  static getAllVentes = async () => {
    return await venteModel.find().populate('client_id').populate('user_id');
  };

  static getVentesByClient = async (clientId) => {
    return await venteModel.find({ client_id: clientId }).populate('client_id').populate('user_id');
  };

  static getVentesByUser = async (userId) => {
    return await venteModel.find({ user_id: userId }).populate('client_id').populate('user_id');
  };

  static updateVente = async (id, update) => {
    return await venteModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).populate('client_id').populate('user_id');
  };

  static deleteVente = async (id) => {
    return await venteModel.findByIdAndDelete(id);
  };
}

export default VenteRepository;
