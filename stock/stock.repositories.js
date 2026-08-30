import stockModel from "./models/stock.models.js";

class StockRepository {
  static createStockMouvement = async (data) => {
    return await stockModel.create(data);
  };

  static getStockById = async (id) => {
    return await stockModel.findById(id).populate('article_id').populate('user_id');
  };

  static getAllStockMouvements = async () => {
    return await stockModel.find().populate('article_id').populate('user_id');
  };

  static getMouvementsByArticle = async (articleId) => {
    return await stockModel.find({ article_id: articleId }).populate('article_id').populate('user_id');
  };

  static getMouvementsByType = async (typeMouvement) => {
    return await stockModel.find({ typeMouvement }).populate('article_id').populate('user_id');
  };

  static deleteStockMouvement = async (id) => {
    return await stockModel.findByIdAndDelete(id);
  };
}

export default StockRepository;
