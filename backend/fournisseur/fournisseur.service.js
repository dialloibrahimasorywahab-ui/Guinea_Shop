import FournisseurRepository from "./fournisseur.repositories.js";

class FournisseurService {
  static createFournisseur = async (data) => {
    return await FournisseurRepository.createFournisseur(data);
  };

  static getFournisseurById = async (id) => {
    return await FournisseurRepository.getFournisseurById(id);
  };

  static getAllFournisseurs = async (queryParams = {}) => {
    return await FournisseurRepository.getAllFournisseurs(queryParams);
  };

  static getFournisseurByTelephone = async (telephone) => {
    return await FournisseurRepository.getFournisseurByTelephone(telephone);
  };

  static updateFournisseur = async (id, update) => {
    return await FournisseurRepository.updateFournisseur(id, update);
  };

  static deleteFournisseur = async (id) => {
    return await FournisseurRepository.deleteFournisseur(id);
  };

  static deleteFournisseurById = async (id) => {
    return await FournisseurRepository.deleteFournisseur(id);
  };
}

export default FournisseurService;
