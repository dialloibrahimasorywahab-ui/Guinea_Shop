import factureModel from "./models/factures.models.js";
import "../ventes/models/ventes.models.js";
import "../clients/models/clients.models.js";
import applyApiFeatures from "../common/utils/apiFeatures.js";

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

  static getAllFactures = async (queryParams = {}) => {
    const query = factureModel.find().populate('vente_id').populate('client_id');
    return await applyApiFeatures(query, queryParams, {
      searchFields: ['numeroFacture', 'statut'],
      filterFields: ['statut', 'client_id', 'vente_id', 'numeroFacture'],
      allowedSortFields: ['dateFacture', 'montantTotal', 'montantPaye', 'montantRestant', 'statut', 'createdAt'],
      defaultSort: { createdAt: -1 },
      aliases: { search: 'q', total: 'montantTotal' },
    });
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
