import paiementModel from "./models/paiement.models.js";

class PaiementRepository {
  static createPaiement = async (data) => {
    return await paiementModel.create(data);
  };

  static getPaiementById = async (id) => {
    return await paiementModel.findById(id).populate('vente_id');
  };

  static getAllPaiements = async () => {
    return await paiementModel.find().populate('vente_id');
  };

  static getPaiementsByVente = async (venteId) => {
    return await paiementModel.find({ vente_id: venteId }).populate('vente_id');
  };

  static getPaiementsByMode = async (modePaiement) => {
    return await paiementModel.find({ modePaiement }).populate('vente_id');
  };

  static updatePaiement = async (id, update) => {
    return await paiementModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).populate('vente_id');
  };

  static deletePaiement = async (id) => {
    return await paiementModel.findByIdAndDelete(id);
  };
}

export default PaiementRepository;
