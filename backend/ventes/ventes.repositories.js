import venteModel from "./models/ventes.models.js";
import "../clients/models/clients.models.js";
import "../users/models/users.models.js";
import applyApiFeatures from "../common/utils/apiFeatures.js";

class VenteRepository {
  static createVente = async (data, session = null) => {
    const vente = new venteModel(data);
    return await vente.save(session ? { session } : undefined);
  };

  static getVenteById = async (id, session = null) => {
    const query = venteModel.findById(id).populate('client_id').populate('user_id');
    if (session) query.session(session);
    return await query;
  };

  static getAllVentes = async (queryParams = {}) => {
    const query = venteModel.find().populate('client_id').populate('user_id');
    return await applyApiFeatures(query, queryParams, {
      searchFields: ['numeroFacture', 'statut'],
      filterFields: ['statut', 'client_id', 'user_id', 'numeroFacture'],
      allowedSortFields: ['dateVente', 'montantTotal', 'statut', 'createdAt'],
      defaultSort: { dateVente: -1 },
      aliases: { search: 'q', date: 'dateVente', total: 'montantTotal' },
    });
  };

  static getVentesByClient = async (clientId) => {
    return await venteModel.find({ client_id: clientId }).populate('client_id').populate('user_id');
  };

  static getVentesByUser = async (userId) => {
    return await venteModel.find({ user_id: userId }).populate('client_id').populate('user_id');
  };

  static updateVente = async (id, update, session = null) => {
    return await venteModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
      ...(session ? { session } : {}),
    }).populate('client_id').populate('user_id');
  };

  static deleteVente = async (id, session = null) => {
    return await venteModel.findByIdAndDelete(id, session ? { session } : undefined);
  };
}

export default VenteRepository;
