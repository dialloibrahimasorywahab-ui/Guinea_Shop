import LigneAchatRepository from "./ligne_achat.repositories.js";

class LigneAchatService {
  static createLigneAchat = async (data, session = null) => {
    const { achat_id, article_id, quantite, prixAchatUnitaire } = data;
    const sousTotal = Number(quantite) * Number(prixAchatUnitaire);

    return await LigneAchatRepository.createLigneAchat(
      {
        achat_id,
        article_id,
        quantite: Number(quantite),
        prixAchatUnitaire: Number(prixAchatUnitaire),
        sousTotal,
      },
      session
    );
  };

  static getLigneAchatById = async (id) => {
    return await LigneAchatRepository.getLigneAchatById(id);
  };

  static getAllLigneAchats = async () => {
    return await LigneAchatRepository.getAllLigneAchats();
  };

  static getLignesByAchatId = async (achatId) => {
    return await LigneAchatRepository.getLignesByAchatId(achatId);
  };

  static deleteLigneAchatById = async (id) => {
    return await LigneAchatRepository.deleteLigneAchatById(id);
  };
}

export default LigneAchatService;
