import FactureService from "./factures.service.js";

class FactureController {
  static createFactureFromVente = async (req, res) => {
    try {
      const { venteId } = req.body;
      const facture = await FactureService.createFactureFromVente(venteId);
      return res.status(201).json({
        success: true,
        data: facture,
        message: "Facture générée avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  /**
   * Payer une facture directement (encaissement atomique + mise à jour trésorerie Finances)
   */
  static payerFacture = async (req, res) => {
    try {
      const payload = {
        ...req.body,
        user_id: req.user.id,
      };
      const result = await FactureService.payerFacture(req.params.id, payload);
      return res.status(200).json({
        success: true,
        data: result,
        message: "Paiement de la facture validé et intégré dans Finances avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getAllFactures = async (req, res) => {
    try {
      const factures = await FactureService.getAllFactures(req.query);
      return res.status(200).json({ success: true, data: factures });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  static getFactureById = async (req, res) => {
    try {
      const facture = await FactureService.getFactureById(req.params.id);
      if (!facture) {
        return res.status(404).json({ success: false, error: "Facture introuvable" });
      }
      return res.status(200).json({ success: true, data: facture });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getFactureByVenteId = async (req, res) => {
    try {
      const { venteId } = req.params;
      const facture = await FactureService.getFactureByVenteId(venteId);
      if (!facture) {
        return res.status(404).json({ success: false, error: "Facture introuvable pour cette vente" });
      }
      return res.status(200).json({ success: true, data: facture });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getFacturesByClient = async (req, res) => {
    try {
      const { clientId } = req.params;
      const factures = await FactureService.getFacturesByClient(clientId);
      return res.status(200).json({ success: true, data: factures });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static deleteFacture = async (req, res) => {
    try {
      const deletedFacture = await FactureService.deleteFactureById(req.params.id);
      if (!deletedFacture) {
        return res.status(404).json({ success: false, error: "Facture introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: deletedFacture,
        message: "Facture supprimée avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };
}

export default FactureController;
