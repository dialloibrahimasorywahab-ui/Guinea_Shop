import factureModel from "./models/factures.models.js";

class FactureRepository {
  static createFacture = async (data) => {
    return await factureModel.create(data);
  };

  static getFactureById = async (id) => {
    return await factureModel.findById(id).populate('vente_id').populate('client_id');
  };

  static getFactureByVenteId = async (venteId) => {
    return await factureModel.findOne({ vente_id: venteId }).populate('vente_id').populate('client_id');
  };

  static getAllFactures = async () => {
    return await factureModel.find().populate('vente_id').populate('client_id');
  };

  static getFacturesByClient = async (clientId) => {
    return await factureModel.find({ client_id: clientId }).populate('vente_id').populate('client_id');
  };

  static updateFacture = async (id, update) => {
    return await factureModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).populate('vente_id').populate('client_id');
  };

  static updateFactureByVenteId = async (venteId, update) => {
    return await factureModel.findOneAndUpdate({ vente_id: venteId }, update, {
      new: true,
      runValidators: true,
    }).populate('vente_id').populate('client_id');
  };

  static deleteFacture = async (id) => {
    return await factureModel.findByIdAndDelete(id);
  };
}

export default FactureRepository;
