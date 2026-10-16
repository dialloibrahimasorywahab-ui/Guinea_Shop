import factureModel from "./models/factures.models.js";

class FactureRepository {
  static createFacture = async (data, session = null) => {
    const facture = new factureModel(data);
    return await facture.save(session ? { session } : undefined);
  };

  static getFactureById = async (id, session = null) => {
    const query = factureModel.findById(id).populate('vente_id').populate('client_id');
    if (session) query.session(session);
    return await query;
  };

  static getFactureByVenteId = async (venteId, session = null) => {
    const query = factureModel.findOne({ vente_id: venteId }).populate('vente_id').populate('client_id');
    if (session) query.session(session);
    return await query;
  };

  static getAllFactures = async () => {
    return await factureModel.find().populate('vente_id').populate('client_id');
  };

  static getFacturesByClient = async (clientId) => {
    return await factureModel.find({ client_id: clientId }).populate('vente_id').populate('client_id');
  };

  static updateFacture = async (id, update, session = null) => {
    return await factureModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
      ...(session ? { session } : {}),
    }).populate('vente_id').populate('client_id');
  };

  static updateFactureByVenteId = async (venteId, update, session = null) => {
    return await factureModel.findOneAndUpdate({ vente_id: venteId }, update, {
      new: true,
      runValidators: true,
      ...(session ? { session } : {}),
    }).populate('vente_id').populate('client_id');
  };

  static deleteFacture = async (id, session = null) => {
    return await factureModel.findByIdAndDelete(id, session ? { session } : undefined);
  };
}

export default FactureRepository;
