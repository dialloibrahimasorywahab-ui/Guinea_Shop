import financeModel from "./models/finances.models.js";

class FinanceRepository {
  static createTransaction = async (data, session = null) => {
    const transaction = new financeModel(data);
    return await transaction.save(session ? { session } : undefined);
  };

  static getTransactionById = async (id, session = null) => {
    const query = financeModel
      .findById(id)
      .populate('user_id')
      .populate('vente_id')
      .populate('achat_id')
      .populate('paiement_id')
      .populate('facture_id');
    if (session) query.session(session);
    return await query;
  };

  static getAllTransactions = async (filter = {}) => {
    return await financeModel
      .find(filter)
      .populate('user_id')
      .populate('vente_id')
      .populate('achat_id')
      .populate('paiement_id')
      .populate('facture_id')
      .sort({ dateTransaction: -1 });
  };

  static getBilanFinancier = async () => {
    const summary = await financeModel.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$montant' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalRecettes = 0;
    let totalDepenses = 0;
    let nbRecettes = 0;
    let nbDepenses = 0;

    for (const item of summary) {
      if (item._id === 'recette') {
        totalRecettes = item.total;
        nbRecettes = item.count;
      } else if (item._id === 'dépense') {
        totalDepenses = item.total;
        nbDepenses = item.count;
      }
    }

    const soldeNet = totalRecettes - totalDepenses;

    return {
      totalRecettes,
      totalDepenses,
      soldeNet,
      nbRecettes,
      nbDepenses,
      nbTransactions: nbRecettes + nbDepenses,
    };
  };

  static deleteTransaction = async (id, session = null) => {
    return await financeModel.findByIdAndDelete(
      id,
      session ? { session } : undefined
    );
  };

  static deleteTransactionsByPaiementId = async (paiementId, session = null) => {
    return await financeModel.deleteMany(
      { paiement_id: paiementId },
      session ? { session } : undefined
    );
  };

  static deleteTransactionsByFactureId = async (factureId, session = null) => {
    return await financeModel.deleteMany(
      { facture_id: factureId },
      session ? { session } : undefined
    );
  };

  static updateTransactionByPaiementId = async (paiementId, update, session = null) => {
    return await financeModel.findOneAndUpdate(
      { paiement_id: paiementId },
      update,
      {
        new: true,
        runValidators: true,
        ...(session ? { session } : {}),
      }
    );
  };
}

export default FinanceRepository;
