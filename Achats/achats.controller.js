import AchatService from "./achats.service.js";

class AchatController {
  static createAchat = async (req, res) => {
    try {
      const payload = {
        ...req.body,
        user_id: req.user.id,
      };
      const result = await AchatService.createAchat(payload);
      return res.status(201).json({
        success: true,
        data: result,
        message: "Achat fournisseur enregistré avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getAllAchats = async (req, res) => {
    try {
      const achats = await AchatService.getAllAchats();
      return res.status(200).json({ success: true, data: achats });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  static getAchatById = async (req, res) => {
    try {
      const result = await AchatService.getAchatById(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, error: "Achat introuvable" });
      }
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getAchatsByFournisseur = async (req, res) => {
    try {
      const { fournisseurId } = req.params;
      const achats = await AchatService.getAchatsByFournisseur(fournisseurId);
      return res.status(200).json({ success: true, data: achats });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static updateAchat = async (req, res) => {
    try {
      const updated = await AchatService.updateAchat(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: "Achat introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: updated,
        message: "Achat mis à jour avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static deleteAchat = async (req, res) => {
    try {
      const deleted = await AchatService.deleteAchatById(req.params.id, req.user?.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Achat introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: deleted,
        message: "Achat annulé et supprimé avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };
}

export default AchatController;
