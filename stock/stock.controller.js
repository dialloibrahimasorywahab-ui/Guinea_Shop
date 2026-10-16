import StockService from "./stock.service.js";

class StockController {
  /**
   * Consultation de l'état global et valorisation du stock
   */
  static getEtatStock = async (req, res) => {
    try {
      const etat = await StockService.getEtatStock();
      return res.status(200).json({
        success: true,
        data: etat,
        message: "État global des stocks et valorisation",
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Consultation des articles sous le seuil d'alerte
   */
  static getArticlesEnAlerte = async (req, res) => {
    try {
      const articles = await StockService.getArticlesEnAlerte();
      return res.status(200).json({
        success: true,
        data: articles,
        message: "Articles en alerte de stock",
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  /**
   * Consultation du stock d'un article spécifique
   */
  static getStockByArticleId = async (req, res) => {
    try {
      const { articleId } = req.params;
      const stock = await StockService.getStockByArticleId(articleId);
      return res.status(200).json({
        success: true,
        data: stock,
      });
    } catch (error) {
      return res.status(404).json({ success: false, error: error.message });
    }
  };

  /**
   * Ajustement manuel de stock (inventaire physique)
   */
  static ajusterStock = async (req, res) => {
    try {
      const payload = {
        ...req.body,
        user_id: req.body.user_id || req.user?.id,
      };
      const result = await StockService.ajusterStock(payload);
      return res.status(200).json({
        success: true,
        data: result,
        message: "Stock ajusté avec succès et mouvement tracé",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };
}

export default StockController;
