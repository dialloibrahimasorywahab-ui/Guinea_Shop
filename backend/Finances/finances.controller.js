import FinanceService from "./finances.service.js";

class FinanceController {
  static createTransaction = async (req, res) => {
    try {
      const payload = {
        ...req.body,
        user_id: req.user.id,
      };
      const transaction = await FinanceService.createTransaction(payload);
      return res.status(201).json({
        success: true,
        data: transaction,
        message: "Transaction financière enregistrée avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getAllTransactions = async (req, res) => {
    try {
      const transactions = await FinanceService.getAllTransactions(req.query);
      return res.status(200).json({ success: true, data: transactions });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  static getBilanFinancier = async (req, res) => {
    try {
      const bilan = await FinanceService.getBilanFinancier();
      return res.status(200).json({
        success: true,
        data: bilan,
        message: "Bilan financier consolidé",
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  static getTransactionById = async (req, res) => {
    try {
      const transaction = await FinanceService.getTransactionById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ success: false, error: "Transaction introuvable" });
      }
      return res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static deleteTransaction = async (req, res) => {
    try {
      const deleted = await FinanceService.deleteTransaction(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Transaction introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: deleted,
        message: "Transaction financière supprimée avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };
}

export default FinanceController;
