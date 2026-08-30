import fournisseurModel from "./models/fournisseur.models.js";

class FournisseurRepository {
  static createFournisseur = async (data) => {
    return await fournisseurModel.create(data);
  };

  static getFournisseurById = async (id) => {
    return await fournisseurModel.findById(id);
  };

  static getAllFournisseurs = async () => {
    return await fournisseurModel.find();
  };

  static getFournisseurByTelephone = async (telephone) => {
    return await fournisseurModel.findOne({ telephone });
  };

  static getFournisseurByEmail = async (email) => {
    return await fournisseurModel.findOne({ email });
  };

  static updateFournisseur = async (id, update) => {
    return await fournisseurModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
  };

  static deleteFournisseur = async (id) => {
    return await fournisseurModel.findByIdAndDelete(id);
  };
}

export default FournisseurRepository;
