import ligneVenteModel from "./models/ligne_ventes.models.js";
import "../ventes/models/ventes.models.js";
import "../articles/models/articles.models.js";

class LigneVenteRepository {
  static createLigneVente = async (data, session = null) => {
    const ligne = new ligneVenteModel(data);
    return await ligne.save(session ? { session } : undefined);
  };

  static getLigneVenteById = async (id, session = null) => {
    const query = ligneVenteModel.findById(id).populate('vente_id').populate('article_id');
    if (session) query.session(session);
    return await query;
  };

  static getAllLigneVentes = async () => {
    return await ligneVenteModel.find().populate('vente_id').populate('article_id');
  };

  static getLignesByVenteId = async (venteId, session = null) => {
    const query = ligneVenteModel.find({ vente_id: venteId }).populate('article_id');
    if (session) query.session(session);
    return await query;
  };

  static deleteLignesByVenteId = async (venteId, session = null) => {
    return await ligneVenteModel.deleteMany({ vente_id: venteId }, session ? { session } : undefined);
  };

  static deleteLigneVenteById = async (id, session = null) => {
    return await ligneVenteModel.findByIdAndDelete(id, session ? { session } : undefined);
  };
}

export default LigneVenteRepository;
