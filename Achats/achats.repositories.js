import achatModel from "./models/achats.models.js";
import applyApiFeatures from "../common/utils/apiFeatures.js";

class AchatRepository {
  static createAchat = async (data, session = null) => {
    const achat = new achatModel(data);
    return await achat.save(session ? { session } : undefined);
  };

  static getAchatById = async (id, session = null) => {
    const query = achatModel
      .findById(id)
      .populate('fournisseur_id')
      .populate('user_id');
    if (session) query.session(session);
    return await query;
  };

  static getAllAchats = async (queryParams = {}) => {
    const query = achatModel
      .find()
      .populate('fournisseur_id')
      .populate('user_id');
    return await applyApiFeatures(query, queryParams, {
      searchFields: ['numeroAchat', 'statut'],
      filterFields: ['statut', 'fournisseur_id', 'user_id', 'numeroAchat'],
      allowedSortFields: ['dateAchat', 'montantTotal', 'statut', 'createdAt'],
      defaultSort: { createdAt: -1 },
      aliases: { search: 'q', total: 'montantTotal' },
    });
  };

  static getAchatsByFournisseur = async (fournisseurId) => {
    return await achatModel
      .find({ fournisseur_id: fournisseurId })
      .populate('fournisseur_id')
      .populate('user_id')
      .sort({ createdAt: -1 });
  };

  static updateAchat = async (id, update, session = null) => {
    return await achatModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
      ...(session ? { session } : {}),
    }).populate('fournisseur_id').populate('user_id');
  };

  static deleteAchat = async (id, session = null) => {
    return await achatModel.findByIdAndDelete(
      id,
      session ? { session } : undefined
    );
  };
}

export default AchatRepository;
