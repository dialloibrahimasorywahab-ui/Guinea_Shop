import mongoose from "mongoose";
import PaiementRepository from "./paiement.repositories.js";
import VenteRepository from "../ventes/ventes.repositories.js";
import FactureRepository from "../factures/factures.repositories.js";
import FactureService from "../factures/factures.service.js";
import FinanceRepository from "../Finances/finances.repositories.js";

class PaiementService {
  /**
   * Enregistre un paiement de façon atomique (ACID) :
   * 1. Vérification de la vente/facture
   * 2. Création du paiement
   * 3. Mise à jour du statut de la vente
   * 4. Resynchronisation de la facture (montantPaye, montantRestant, statut)
   * 5. Génération directe de la transaction recette dans Finances
   */
  static createPaiement = async (data) => {
    let { vente_id, facture_id, montant, modePaiement, statut, user_id, description } = data;

    // Si facture_id est fourni sans vente_id, retrouver la vente associée
    if (!vente_id && facture_id) {
      const facture = await FactureRepository.getFactureById(facture_id);
      if (!facture) {
        throw new Error(`Facture ID ${facture_id} introuvable`);
      }
      vente_id = facture.vente_id?._id || facture.vente_id;
    }

    if (!vente_id) {
      throw new Error("L'identifiant de la vente ou de la facture est obligatoire");
    }

    const session = await mongoose.startSession();
    let isTransactionActive = false;

    try {
      try {
        session.startTransaction();
        isTransactionActive = true;
      } catch (e) {
        isTransactionActive = false;
      }

      const sessionOption = isTransactionActive ? session : null;

      // 1. Récupération et vérification de la vente
      const vente = await VenteRepository.getVenteById(vente_id, sessionOption);
      if (!vente) {
        throw new Error(`Vente ID ${vente_id} introuvable`);
      }

      // 2. Récupérer ou générer la facture associée
      let facture = await FactureRepository.getFactureByVenteId(vente_id, sessionOption);
      if (!facture) {
        facture = await FactureService.createFactureFromVente(vente_id, sessionOption);
      }

      const paymentStatus = statut || 'validé';
      const paymentMode = modePaiement || 'espèces';

      // 3. Création du document paiement
      const newPaiement = await PaiementRepository.createPaiement(
        {
          vente_id,
          montant: Number(montant),
          modePaiement: paymentMode,
          statut: paymentStatus,
          datePaiement: data.datePaiement || new Date(),
        },
        sessionOption
      );

      // 4. Calcul du cumul des paiements et mise à jour de la vente
      const paiements = await PaiementRepository.getPaiementsByVente(vente_id, sessionOption);
      const totalPaye = paiements
        .filter((p) => p.statut === 'validé' || p.statut === 'valide')
        .reduce((acc, p) => acc + p.montant, 0);

      if (totalPaye >= vente.montantTotal && vente.statut !== 'payée') {
        await VenteRepository.updateVente(vente_id, { statut: 'payée' }, sessionOption);
      }

      // 5. Synchronisation atomique de la facture
      const updatedFacture = await FactureService.syncFacturePaiements(vente_id, sessionOption);

      // 6. ACTION DIRECTE DANS FINANCES (Trésorerie)
      let financeTransaction = null;
      if (paymentStatus === 'validé' || paymentStatus === 'valide') {
        const numFacture =
          updatedFacture?.numeroFacture ||
          facture?.numeroFacture ||
          vente?.numeroFacture ||
          vente._id;

        financeTransaction = await FinanceRepository.createTransaction(
          {
            type: 'recette',
            categorie: 'vente',
            montant: Number(montant),
            modePaiement: paymentMode,
            description:
              description ||
              `Encaissement Vente / Facture N° ${numFacture}`,
            user_id: user_id || vente.user_id?._id || vente.user_id,
            vente_id: vente._id,
            facture_id: updatedFacture?._id || facture?._id,
            paiement_id: newPaiement._id,
            dateTransaction: new Date(),
          },
          sessionOption
        );
      }

      // 7. Validation de la transaction ACID
      if (isTransactionActive) {
        await session.commitTransaction();
      }

      const fullPaiement = await PaiementRepository.getPaiementById(newPaiement._id);
      return {
        paiement: fullPaiement,
        facture: updatedFacture || facture,
        financeTransaction,
      };
    } catch (error) {
      if (isTransactionActive) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      await session.endSession();
    }
  };

  /**
   * Mise à jour atomique d'un paiement avec synchronisation Facture et Finances
   */
  static updatePaiement = async (id, update) => {
    const session = await mongoose.startSession();
    let isTransactionActive = false;

    try {
      try {
        session.startTransaction();
        isTransactionActive = true;
      } catch (e) {
        isTransactionActive = false;
      }

      const sessionOption = isTransactionActive ? session : null;

      const existingPaiement = await PaiementRepository.getPaiementById(id, sessionOption);
      if (!existingPaiement) {
        throw new Error(`Paiement ID ${id} introuvable`);
      }

      const updatedPaiement = await PaiementRepository.updatePaiement(id, update, sessionOption);
      const venteId = existingPaiement.vente_id?._id || existingPaiement.vente_id;

      // Resynchroniser la facture
      await FactureService.syncFacturePaiements(venteId, sessionOption);

      // Resynchroniser le statut de la vente
      const paiements = await PaiementRepository.getPaiementsByVente(venteId, sessionOption);
      const totalPaye = paiements
        .filter((p) => p.statut === 'validé' || p.statut === 'valide')
        .reduce((acc, p) => acc + p.montant, 0);

      const vente = await VenteRepository.getVenteById(venteId, sessionOption);
      if (vente) {
        const newStatut = totalPaye >= vente.montantTotal ? 'payée' : 'en_attente';
        if (vente.statut !== newStatut) {
          await VenteRepository.updateVente(venteId, { statut: newStatut }, sessionOption);
        }
      }

      // Resynchroniser l'écriture financière associée
      if (update.montant || update.modePaiement) {
        const financeUpdate = {};
        if (update.montant) financeUpdate.montant = Number(update.montant);
        if (update.modePaiement) financeUpdate.modePaiement = update.modePaiement;
        await FinanceRepository.updateTransactionByPaiementId(id, financeUpdate, sessionOption);
      }

      if (isTransactionActive) {
        await session.commitTransaction();
      }

      return updatedPaiement;
    } catch (error) {
      if (isTransactionActive) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      await session.endSession();
    }
  };

  /**
   * Suppression atomique d'un paiement avec rollback dans Finances, Facture et Vente
   */
  static deletePaiement = async (id) => {
    const session = await mongoose.startSession();
    let isTransactionActive = false;

    try {
      try {
        session.startTransaction();
        isTransactionActive = true;
      } catch (e) {
        isTransactionActive = false;
      }

      const sessionOption = isTransactionActive ? session : null;

      const paiement = await PaiementRepository.getPaiementById(id, sessionOption);
      if (!paiement) {
        throw new Error(`Paiement ID ${id} introuvable`);
      }

      const venteId = paiement.vente_id?._id || paiement.vente_id;

      // 1. Suppression de la transaction financière liée
      await FinanceRepository.deleteTransactionsByPaiementId(id, sessionOption);

      // 2. Suppression du paiement
      const deletedPaiement = await PaiementRepository.deletePaiement(id, sessionOption);

      // 3. Recalcul et resynchronisation de la facture
      await FactureService.syncFacturePaiements(venteId, sessionOption);

      // 4. Recalcul du statut de la vente
      const remainingPaiements = await PaiementRepository.getPaiementsByVente(venteId, sessionOption);
      const totalPaye = remainingPaiements
        .filter((p) => p.statut === 'validé' || p.statut === 'valide')
        .reduce((acc, p) => acc + p.montant, 0);

      const vente = await VenteRepository.getVenteById(venteId, sessionOption);
      if (vente) {
        const newStatut = totalPaye >= vente.montantTotal ? 'payée' : 'en_attente';
        if (vente.statut !== newStatut) {
          await VenteRepository.updateVente(venteId, { statut: newStatut }, sessionOption);
        }
      }

      if (isTransactionActive) {
        await session.commitTransaction();
      }

      return deletedPaiement;
    } catch (error) {
      if (isTransactionActive) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      await session.endSession();
    }
  };

  static deletePaiementById = async (id) => {
    return await this.deletePaiement(id);
  };

  static getPaiementById = async (id) => {
    return await PaiementRepository.getPaiementById(id);
  };

  static getAllPaiements = async () => {
    return await PaiementRepository.getAllPaiements();
  };

  static getPaiementsByVente = async (venteId) => {
    return await PaiementRepository.getPaiementsByVente(venteId);
  };

  static getPaiementsByMode = async (modePaiement) => {
    return await PaiementRepository.getPaiementsByMode(modePaiement);
  };
}

export default PaiementService;
