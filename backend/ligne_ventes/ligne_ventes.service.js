import LigneVenteRepository from "./ligne_ventes.repositories.js";

class LigneVenteService {
  static createLigneVente = async (data) => {
    return await LigneVenteRepository.createLigneVente(data);
  };

  static getLigneVenteById = async (id) => {
    return await LigneVenteRepository.getLigneVenteById(id);
  };

  static getAllLigneVentes = async () => {
    return await LigneVenteRepository.getAllLigneVentes();
  };

  static getLignesByVenteId = async (venteId) => {
    return await LigneVenteRepository.getLignesByVenteId(venteId);
  };

  static deleteLignesByVenteId = async (venteId) => {
    return await LigneVenteRepository.deleteLignesByVenteId(venteId);
  };

  static deleteLigneVenteById = async (id) => {
    return await LigneVenteRepository.deleteLigneVenteById(id);
  };
}

export default LigneVenteService;
