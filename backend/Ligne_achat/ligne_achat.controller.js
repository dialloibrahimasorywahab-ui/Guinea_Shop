import LigneAchatService from "./ligne_achat.service.js";

class LigneAchatController {
  static createLigneAchat = async (req, res) => {
    try {
      const ligne = await LigneAchatService.createLigneAchat(req.body);
      return res.status(201).json({
        success: true,
        data: ligne,
        message: "Ligne d'achat créée avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getAllLigneAchats = async (req, res) => {
    try {
      const lignes = await LigneAchatService.getAllLigneAchats();
      return res.status(200).json({ success: true, data: lignes });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  static getLigneAchatById = async (req, res) => {
    try {
      const ligne = await LigneAchatService.getLigneAchatById(req.params.id);
      if (!ligne) {
        return res.status(404).json({ success: false, error: "Ligne d'achat introuvable" });
      }
      return res.status(200).json({ success: true, data: ligne });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getLignesByAchatId = async (req, res) => {
    try {
      const { achatId } = req.params;
      const lignes = await LigneAchatService.getLignesByAchatId(achatId);
      return res.status(200).json({ success: true, data: lignes });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static deleteLigneAchat = async (req, res) => {
    try {
      const deleted = await LigneAchatService.deleteLigneAchatById(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Ligne d'achat introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: deleted,
        message: "Ligne d'achat supprimée avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };
}

export default LigneAchatController;
