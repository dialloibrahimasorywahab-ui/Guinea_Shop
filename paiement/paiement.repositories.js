import paiementModel from "./models/paiement.models.js";

class PaiementRepository {
  static createPaiement = async (data, session = null) => {
    const paiement = new paiementModel(data);
    return await paiement.save(session ? { session } : undefined);
  };

  static getPaiementById = async (id, session = null) => {
    const query = paiementModel.findById(id).populate('vente_id');
    if (session) query.session(session);
    return await query;
  };

  static getAllPaiements = async () => {
    return await paiementModel.find().populate('vente_id').sort({ datePaiement: -1 });
  };

  static getPaiementsByVente = async (venteId, session = null) => {
    const query = paiementModel.find({ vente_id: venteId }).populate('vente_id');
    if (session) query.session(session);
    return await query;
  };

  static getPaiementsByMode = async (modePaiement) => {
    return await paiementModel.find({ modePaiement }).populate('vente_id');
  };

  static updatePaiement = async (id, update, session = null) => {
    return await paiementModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
      ...(session ? { session } : {}),
    }).populate('vente_id');
  };

  static deletePaiement = async (id, session = null) => {
    return await paiementModel.findByIdAndDelete(id, session ? { session } : undefined);
  };
}

export default PaiementRepository;
