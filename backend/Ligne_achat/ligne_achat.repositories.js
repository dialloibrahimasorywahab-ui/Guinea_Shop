import ligneAchatModel from "./models/ligne_achat.models.js";

class LigneAchatRepository {
  static createLigneAchat = async (data, session = null) => {
    const ligne = new ligneAchatModel(data);
    return await ligne.save(session ? { session } : undefined);
  };

  static getLigneAchatById = async (id, session = null) => {
    const query = ligneAchatModel
      .findById(id)
      .populate('achat_id')
      .populate('article_id');
    if (session) query.session(session);
    return await query;
  };

  static getAllLigneAchats = async () => {
    return await ligneAchatModel
      .find()
      .populate('achat_id')
      .populate('article_id');
  };

  static getLignesByAchatId = async (achatId, session = null) => {
    const query = ligneAchatModel
      .find({ achat_id: achatId })
      .populate('article_id');
    if (session) query.session(session);
    return await query;
  };

  static deleteLignesByAchatId = async (achatId, session = null) => {
    return await ligneAchatModel.deleteMany(
      { achat_id: achatId },
      session ? { session } : undefined
    );
  };

  static deleteLigneAchatById = async (id, session = null) => {
    return await ligneAchatModel.findByIdAndDelete(
      id,
      session ? { session } : undefined
    );
  };
}

export default LigneAchatRepository;
