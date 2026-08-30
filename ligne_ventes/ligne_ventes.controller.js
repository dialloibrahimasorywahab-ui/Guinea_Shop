import LigneVenteService from "./ligne_ventes.service.js";

class LigneVenteController {
  static createLigneVente = async (req, res) => {
    try {
      const newLigne = await LigneVenteService.createLigneVente(req.body);
      return res.status(201).json({
        success: true,
        data: newLigne,
        message: "Ligne de vente créée avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getAllLigneVentes = async (req, res) => {
    try {
      const lignes = await LigneVenteService.getAllLigneVentes();
      return res.status(200).json({ success: true, data: lignes });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  static getLigneVenteById = async (req, res) => {
    try {
      const ligne = await LigneVenteService.getLigneVenteById(req.params.id);
      if (!ligne) {
        return res.status(404).json({ success: false, error: "Ligne de vente introuvable" });
      }
      return res.status(200).json({ success: true, data: ligne });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getLignesByVenteId = async (req, res) => {
    try {
      const { venteId } = req.params;
      const lignes = await LigneVenteService.getLignesByVenteId(venteId);
      return res.status(200).json({ success: true, data: lignes });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static deleteLigneVente = async (req, res) => {
    try {
      const deletedLigne = await LigneVenteService.deleteLigneVenteById(req.params.id);
      if (!deletedLigne) {
        return res.status(404).json({ success: false, error: "Ligne de vente introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: deletedLigne,
        message: "Ligne de vente supprimée avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };
}

export default LigneVenteController;
