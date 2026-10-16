import PaiementService from "./paiement.service.js";

class PaiementController {
  static createPaiement = async (req, res) => {
    try {
      const payload = {
        ...req.body,
        user_id: req.body.user_id || req.user?.id,
      };
      const result = await PaiementService.createPaiement(payload);
      return res.status(201).json({
        success: true,
        data: result,
        message: "Paiement enregistré et intégré dans Finances avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getAllPaiements = async (req, res) => {
    try {
      const paiements = await PaiementService.getAllPaiements();
      return res.status(200).json({ success: true, data: paiements });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  static getPaiementById = async (req, res) => {
    try {
      const paiement = await PaiementService.getPaiementById(req.params.id);
      if (!paiement) {
        return res.status(404).json({ success: false, error: "Paiement introuvable" });
      }
      return res.status(200).json({ success: true, data: paiement });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getPaiementsByVente = async (req, res) => {
    try {
      const { venteId } = req.params;
      const paiements = await PaiementService.getPaiementsByVente(venteId);
      return res.status(200).json({ success: true, data: paiements });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getPaiementsByMode = async (req, res) => {
    try {
      const { mode } = req.params;
      const paiements = await PaiementService.getPaiementsByMode(mode);
      return res.status(200).json({ success: true, data: paiements });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static updatePaiement = async (req, res) => {
    try {
      const updatedPaiement = await PaiementService.updatePaiement(req.params.id, req.body);
      if (!updatedPaiement) {
        return res.status(404).json({ success: false, error: "Paiement introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: updatedPaiement,
        message: "Paiement mis à jour avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static deletePaiement = async (req, res) => {
    try {
      const deletedPaiement = await PaiementService.deletePaiementById(req.params.id);
      if (!deletedPaiement) {
        return res.status(404).json({ success: false, error: "Paiement introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: deletedPaiement,
        message: "Paiement supprimé avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };
}

export default PaiementController;
