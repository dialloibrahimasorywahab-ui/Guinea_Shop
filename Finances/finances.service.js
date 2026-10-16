import FinanceRepository from "./finances.repositories.js";

class FinanceService {
  static createTransaction = async (data, session = null) => {
    const {
      type,
      categorie,
      montant,
      modePaiement,
      description,
      user_id,
      vente_id,
      achat_id,
      paiement_id,
    } = data;

    return await FinanceRepository.createTransaction(
      {
        type,
        categorie: categorie || 'autre',
        montant: Number(montant),
        modePaiement: modePaiement || 'espèces',
        description: description || '',
        user_id,
        vente_id: vente_id || null,
        achat_id: achat_id || null,
        paiement_id: paiement_id || null,
        dateTransaction: new Date(),
      },
      session
    );
  };

  static getAllTransactions = async (filter = {}) => {
    return await FinanceRepository.getAllTransactions(filter);
  };

  static getTransactionById = async (id) => {
    return await FinanceRepository.getTransactionById(id);
  };

  static getBilanFinancier = async () => {
    return await FinanceRepository.getBilanFinancier();
  };

  static deleteTransaction = async (id) => {
    return await FinanceRepository.deleteTransaction(id);
  };
}

export default FinanceService;
