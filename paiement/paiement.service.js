import PaiementRepository from "./paiement.repositories.js";
import VenteRepository from "../ventes/ventes.repositories.js";
import FactureRepository from "../factures/factures.repositories.js";
import FactureService from "../factures/factures.service.js";
import FinanceRepository from "../Finances/finances.repositories.js";
import runInTransaction from "../common/db/transaction.js";

class PaiementService {
  /**
   * Synchronisation stricte de l'écriture financière (T2.2) :
   * Une recette existe pour un paiement si et seulement si son statut est 'validé'.
   */
  static syncFinance = async (paiement, metadata = {}, session = null) => {
    if (paiement.statut === 'validé') {
      return await FinanceRepository.upsertByPaiementId(
        paiement._id,
        {
          type: 'recette',
          categorie: 'vente',
          montant: paiement.montant,
          modePaiement: paiement.modePaiement,
          vente_id: paiement.vente_id?._id || paiement.vente_id,
          facture_id: metadata.facture_id || null,
          user_id: metadata.user_id || paiement.user_id,
          description: metadata.description || `Encaissement Paiement N° ${paiement._id}`,
          dateTransaction: paiement.datePaiement || new Date(),
        },
        session
      );
    }
    // Si le statut passe à 'échoué' ou 'en_attente', retirer la recette
    return await FinanceRepository.deleteTransactionsByPaiementId(paiement._id, session);
  };

  /**
   * Enregistre un paiement avec transaction ACID, plafond de paiement et synchronisation
   */
  static createPaiement = async (data) => {
    return await runInTransaction(async (session) => {
      let { vente_id, facture_id, montant, modePaiement, statut, user_id, description } = data;

      // 1. Résolution de la vente associée
      if (!vente_id && facture_id) {
        const facture = await FactureRepository.getFactureById(facture_id, session);
        if (!facture) {
          throw new Error(`Facture ID ${facture_id} introuvable`);
        }
        vente_id = facture.vente_id?._id || facture.vente_id;
      }

      if (!vente_id) {
        throw new Error("L'identifiant de la vente ou de la facture est obligatoire");
      }

      // 2. Vérification de la vente
      const vente = await VenteRepository.getVenteById(vente_id, session);
      if (!vente) {
        throw new Error(`Vente ID ${vente_id} introuvable`);
      }

      if (vente.statut === 'annulée') {
        throw new Error("Impossible d'enregistrer un paiement sur une vente annulée");
      }

      // 3. Calcul du cumul déjà payé et contrôle du plafond (C3)
      const paiementsExistants = await PaiementRepository.getPaiementsByVente(vente_id, session);
      const dejaPaye = paiementsExistants
        .filter((p) => p.statut === 'validé')
        .reduce((acc, p) => acc + p.montant, 0);

      const resteAPayer = vente.montantTotal - dejaPaye;

      if (resteAPayer <= 0) {
        throw new Error("Cette vente est déjà intégralement payée");
      }

      const paymentStatus = statut || 'validé';
      const paymentMode = modePaiement || 'espèces';
      const montantPaiement = Number(montant);

      if (paymentStatus === 'validé' && montantPaiement > resteAPayer) {
        throw new Error(
          `Le montant (${montantPaiement.toLocaleString()} GNF) dépasse le solde restant dû (${resteAPayer.toLocaleString()} GNF)`
        );
      }

      // 4. Création du paiement
      const newPaiement = await PaiementRepository.createPaiement(
        {
          vente_id,
          montant: montantPaiement,
          modePaiement: paymentMode,
          statut: paymentStatus,
          datePaiement: data.datePaiement || new Date(),
        },
        session
      );

      // 5. Mise à jour du statut de la vente
      const totalApresPaiement = dejaPaye + (paymentStatus === 'validé' ? montantPaiement : 0);
      if (totalApresPaiement >= vente.montantTotal && vente.statut !== 'payée') {
        await VenteRepository.updateVente(vente_id, { statut: 'payée' }, session);
      }

      // 6. Resynchronisation de la facture
      const updatedFacture = await FactureService.syncFacturePaiements(vente_id, session);

      // 7. Synchronisation dans Finances
      const numFacture = updatedFacture?.numeroFacture || vente?.numeroFacture || vente._id;
      const desc = description || `Encaissement Facture N° ${numFacture}`;

      const financeTransaction = await PaiementService.syncFinance(
        newPaiement,
        {
          facture_id: updatedFacture?._id,
          user_id,
          description: desc,
        },
        session
      );

      const fullPaiement = await PaiementRepository.getPaiementById(newPaiement._id, session);
      return {
        paiement: fullPaiement,
        facture: updatedFacture,
        financeTransaction,
      };
    });
  };

  /**
   * Mise à jour d'un paiement avec recalcul facture, statut vente et synchronisation Finances
   */
  static updatePaiement = async (id, update, operatorUserId = null) => {
    return await runInTransaction(async (session) => {
      const existingPaiement = await PaiementRepository.getPaiementById(id, session);
      if (!existingPaiement) {
        throw new Error(`Paiement ID ${id} introuvable`);
      }

      const venteId = existingPaiement.vente_id?._id || existingPaiement.vente_id;
      const vente = await VenteRepository.getVenteById(venteId, session);

      if (vente && vente.statut === 'annulée') {
        throw new Error("Impossible de modifier un paiement sur une vente annulée");
      }

      const updatedPaiement = await PaiementRepository.updatePaiement(id, update, session);

      // Resynchroniser la facture
      await FactureService.syncFacturePaiements(venteId, session);

      // Resynchroniser le statut de la vente (ne jamais repasser une vente annulée à en_attente)
      if (vente && vente.statut !== 'annulée') {
        const paiements = await PaiementRepository.getPaiementsByVente(venteId, session);
        const totalPaye = paiements
          .filter((p) => p.statut === 'validé')
          .reduce((acc, p) => acc + p.montant, 0);

        const newStatut = totalPaye >= vente.montantTotal ? 'payée' : 'en_attente';
        if (vente.statut !== newStatut) {
          await VenteRepository.updateVente(venteId, { statut: newStatut }, session);
        }
      }

      // Resynchroniser le journal financier (crée ou supprime la recette selon statut)
      await PaiementService.syncFinance(
        updatedPaiement,
        {
          user_id: operatorUserId,
          description: `Mise à jour Paiement N° ${id}`,
        },
        session
      );

      return updatedPaiement;
    });
  };

  /**
   * Suppression d'un paiement avec rollback dans Finances, Facture et Vente
   */
  static deletePaiement = async (id) => {
    return await runInTransaction(async (session) => {
      const paiement = await PaiementRepository.getPaiementById(id, session);
      if (!paiement) {
        throw new Error(`Paiement ID ${id} introuvable`);
      }

      const venteId = paiement.vente_id?._id || paiement.vente_id;

      // 1. Suppression de la transaction financière liée
      await FinanceRepository.deleteTransactionsByPaiementId(id, session);

      // 2. Suppression du paiement
      const deletedPaiement = await PaiementRepository.deletePaiement(id, session);

      // 3. Recalcul et resynchronisation de la facture
      await FactureService.syncFacturePaiements(venteId, session);

      // 4. Recalcul du statut de la vente (ne pas altérer si annulée)
      const vente = await VenteRepository.getVenteById(venteId, session);
      if (vente && vente.statut !== 'annulée') {
        const remainingPaiements = await PaiementRepository.getPaiementsByVente(venteId, session);
        const totalPaye = remainingPaiements
          .filter((p) => p.statut === 'validé')
          .reduce((acc, p) => acc + p.montant, 0);

        const newStatut = totalPaye >= vente.montantTotal ? 'payée' : 'en_attente';
        if (vente.statut !== newStatut) {
          await VenteRepository.updateVente(venteId, { statut: newStatut }, session);
        }
      }

      return deletedPaiement;
    });
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
