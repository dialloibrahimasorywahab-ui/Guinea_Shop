import MouvementStockService from "./mouvement_stock.service.js";

class MouvementStockController {
  static createMouvement = async (req, res) => {
    try {
      const payload = {
        ...req.body,
        user_id: req.user.id,
      };
      const mouvement = await MouvementStockService.createMouvement(payload);
      return res.status(201).json({
        success: true,
        data: mouvement,
        message: "Mouvement de stock enregistré avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getAllMouvements = async (req, res) => {
    try {
      const mouvements = await MouvementStockService.getAllMouvements();
      return res.status(200).json({ success: true, data: mouvements });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  static getMouvementById = async (req, res) => {
    try {
      const mouvement = await MouvementStockService.getMouvementById(req.params.id);
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
      const mouvements = await MouvementStockService.getMouvementsByArticle(articleId);
      return res.status(200).json({ success: true, data: mouvements });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getMouvementsByType = async (req, res) => {
    try {
      const { type } = req.params;
      const mouvements = await MouvementStockService.getMouvementsByType(type);
      return res.status(200).json({ success: true, data: mouvements });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static deleteMouvement = async (req, res) => {
    try {
      const deletedMouvement = await MouvementStockService.deleteMouvement(req.params.id);
      if (!deletedMouvement) {
        return res.status(404).json({ success: false, error: "Mouvement introuvable" });
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

export default MouvementStockController;
