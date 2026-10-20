import mouvementStockModel from "./models/mouvement_stock.models.js";
import applyApiFeatures from "../common/utils/apiFeatures.js";

class MouvementStockRepository {
  static createMouvement = async (data, session = null) => {
    const mouvement = new mouvementStockModel(data);
    return await mouvement.save(session ? { session } : undefined);
  };

  static getMouvementById = async (id, session = null) => {
    const query = mouvementStockModel
      .findById(id)
      .populate('article_id')
      .populate('user_id')
      .populate('achat_id')
      .populate('vente_id');
    if (session) query.session(session);
    return await query;
  };

  static getAllMouvements = async (queryParams = {}) => {
    const query = mouvementStockModel
      .find()
      .populate('article_id')
      .populate('user_id')
      .populate('achat_id')
      .populate('vente_id');
    return await applyApiFeatures(query, queryParams, {
      searchFields: ['motif'],
      filterFields: ['typeMouvement', 'article_id', 'user_id'],
      allowedSortFields: ['dateMouvement', 'quantite', 'typeMouvement', 'createdAt'],
      defaultSort: { createdAt: -1 },
      aliases: { search: 'q', type: 'typeMouvement' },
    });
  };

  static getMouvementsByArticle = async (articleId) => {
    return await mouvementStockModel
      .find({ article_id: articleId })
      .populate('article_id')
      .populate('user_id')
      .populate('achat_id')
      .populate('vente_id')
      .sort({ createdAt: -1 });
  };

  static getMouvementsByType = async (typeMouvement) => {
    return await mouvementStockModel
      .find({ typeMouvement })
      .populate('article_id')
      .populate('user_id')
      .populate('achat_id')
      .populate('vente_id')
      .sort({ createdAt: -1 });
  };

  static deleteMouvement = async (id, session = null) => {
    return await mouvementStockModel.findByIdAndDelete(
      id,
      session ? { session } : undefined
    );
  };
}

export default MouvementStockRepository;
