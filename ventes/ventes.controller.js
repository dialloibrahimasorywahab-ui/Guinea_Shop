import VenteService from "./ventes.service.js";

class VenteController {
  static createVente = async (req, res) => {
    try {
      const payload = {
        ...req.body,
        user_id: req.user.id,
      };
      const result = await VenteService.createVente(payload);
      return res.status(201).json({
        success: true,
        data: result,
        message: "Vente effectuée avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static annulerVente = async (req, res) => {
    try {
      const result = await VenteService.annulerVente(req.params.id, req.user.id);
      return res.status(200).json({
        success: true,
        data: result,
        message: "Vente annulée avec succès et stocks réintégrés",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getAllVentes = async (req, res) => {
    try {
      const ventes = await VenteService.getAllVentes();
      return res.status(200).json({ success: true, data: ventes });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  static getVenteById = async (req, res) => {
    try {
      const result = await VenteService.getVenteById(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, error: "Vente introuvable" });
      }
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getVentesByClient = async (req, res) => {
    try {
      const { clientId } = req.params;
      const ventes = await VenteService.getVentesByClient(clientId);
      return res.status(200).json({ success: true, data: ventes });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getVentesByUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const ventes = await VenteService.getVentesByUser(userId);
      return res.status(200).json({ success: true, data: ventes });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static updateVente = async (req, res) => {
    try {
      const updatedVente = await VenteService.updateVente(req.params.id, req.body);
      if (!updatedVente) {
        return res.status(404).json({ success: false, error: "Vente introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: updatedVente,
        message: "Vente mise à jour avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static deleteVente = async (req, res) => {
    try {
      const deletedVente = await VenteService.deleteVenteById(req.params.id, req.user?.id);
      if (!deletedVente) {
        return res.status(404).json({ success: false, error: "Vente introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: deletedVente,
        message: "Vente supprimée avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };
}

export default VenteController;
