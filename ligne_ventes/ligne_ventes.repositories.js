import ligneVenteModel from "./models/ligne_ventes.models.js";

class LigneVenteRepository {
  static createLigneVente = async (data) => {
    return await ligneVenteModel.create(data);
  };

  static getLigneVenteById = async (id) => {
    return await ligneVenteModel.findById(id).populate('vente_id').populate('article_id');
  };

  static getAllLigneVentes = async () => {
    return await ligneVenteModel.find().populate('vente_id').populate('article_id');
  };

  static getLignesByVenteId = async (venteId) => {
    return await ligneVenteModel.find({ vente_id: venteId }).populate('article_id');
  };

  static deleteLignesByVenteId = async (venteId) => {
    return await ligneVenteModel.deleteMany({ vente_id: venteId });
  };

  static deleteLigneVenteById = async (id) => {
    return await ligneVenteModel.findByIdAndDelete(id);
  };
}

export default LigneVenteRepository;

