import StockService from "./stock.service.js";

class StockController {
  static createStockMouvement = async (req, res) => {
    try {
      const mouvement = await StockService.createStockMouvement(req.body);
      return res.status(201).json({
        success: true,
        data: mouvement,
        message: "Mouvement de stock enregistré avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getAllStockMouvements = async (req, res) => {
    try {
      const mouvements = await StockService.getAllStockMouvements();
      return res.status(200).json({ success: true, data: mouvements });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  static getStockById = async (req, res) => {
    try {
      const mouvement = await StockService.getStockById(req.params.id);
      if (!mouvement) {
        return res.status(404).json({ success: false, error: "Mouvement de stock introuvable" });
      }
      return res.status(200).json({ success: true, data: mouvement });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getMouvementsByArticle = async (req, res) => {
    try {
      const { articleId } = req.params;
      const mouvements = await StockService.getMouvementsByArticle(articleId);
      return res.status(200).json({ success: true, data: mouvements });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getMouvementsByType = async (req, res) => {
    try {
      const { type } = req.params;
      const mouvements = await StockService.getMouvementsByType(type);
      return res.status(200).json({ success: true, data: mouvements });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static deleteStockMouvement = async (req, res) => {
    try {
      const deletedMouvement = await StockService.deleteStockMouvementById(req.params.id);
      if (!deletedMouvement) {
        return res.status(404).json({ success: false, error: "Mouvement de stock introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: deletedMouvement,
        message: "Mouvement de stock supprimé avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };
}

export default StockController;
