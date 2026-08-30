import FournisseurService from "./fournisseur.service.js";

class FournisseurController {
  static createFournisseur = async (req, res) => {
    try {
      const newFournisseur = await FournisseurService.createFournisseur(req.body);
      return res.status(201).json({
        success: true,
        data: newFournisseur,
        message: "Fournisseur créé avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getAllFournisseurs = async (req, res) => {
    try {
      const fournisseurs = await FournisseurService.getAllFournisseurs();
      return res.status(200).json({ success: true, data: fournisseurs });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  static getFournisseurById = async (req, res) => {
    try {
      const fournisseur = await FournisseurService.getFournisseurById(req.params.id);
      if (!fournisseur) {
        return res.status(404).json({ success: false, error: "Fournisseur introuvable" });
      }
      return res.status(200).json({ success: true, data: fournisseur });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getFournisseurByTelephone = async (req, res) => {
    try {
      const { telephone } = req.params;
      const fournisseur = await FournisseurService.getFournisseurByTelephone(telephone);
      if (!fournisseur) {
        return res.status(404).json({ success: false, error: "Fournisseur introuvable avec ce numéro" });
      }
      return res.status(200).json({ success: true, data: fournisseur });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static updateFournisseur = async (req, res) => {
    try {
      const updatedFournisseur = await FournisseurService.updateFournisseur(req.params.id, req.body);
      if (!updatedFournisseur) {
        return res.status(404).json({ success: false, error: "Fournisseur introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: updatedFournisseur,
        message: "Fournisseur mis à jour avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static deleteFournisseur = async (req, res) => {
    try {
      const deletedFournisseur = await FournisseurService.deleteFournisseurById(req.params.id);
      if (!deletedFournisseur) {
        return res.status(404).json({ success: false, error: "Fournisseur introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: deletedFournisseur,
        message: "Fournisseur supprimé avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };
}

export default FournisseurController;
