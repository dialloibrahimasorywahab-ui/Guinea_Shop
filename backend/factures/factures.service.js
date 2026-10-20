import FactureRepository from "./factures.repositories.js";
import VenteRepository from "../ventes/ventes.repositories.js";
import PaiementRepository from "../paiement/paiement.repositories.js";
import PaiementService from "../paiement/paiement.service.js";
import FinanceRepository from "../Finances/finances.repositories.js";

class FactureService {
  /**
   * Création d'une facture à partir d'une vente (automatique ou manuelle)
   */
  static createFactureFromVente = async (venteId, session = null) => {
    const vente = await VenteRepository.getVenteById(venteId, session);
    if (!vente) {
      throw new Error(`Vente ID ${venteId} introuvable`);
    }

    const existingFacture = await FactureRepository.getFactureByVenteId(venteId, session);
    if (existingFacture) {
      return existingFacture;
    }

    const paiements = await PaiementRepository.getPaiementsByVente(venteId, session);
    const montantPaye = paiements
      .filter((p) => p.statut === 'validé' || p.statut === 'valide')
      .reduce((acc, p) => acc + p.montant, 0);

    const montantRestant = Math.max(0, vente.montantTotal - montantPaye);

    let statut = 'impayée';
    if (montantPaye >= vente.montantTotal) {
      statut = 'payée';
    } else if (montantPaye > 0) {
      statut = 'partiellement_payée';
    }

    return await FactureRepository.createFacture(
      {
        vente_id: vente._id,
        numeroFacture: vente.numeroFacture,
        client_id: vente.client_id?._id || vente.client_id,
        montantTotal: vente.montantTotal,
        montantPaye,
        montantRestant,
        statut,
      },
      session
    );
  };

  /**
   * Synchronise de façon atomique les montants et le statut de la facture liée à une vente
   */
  static syncFacturePaiements = async (venteId, session = null) => {
    const facture = await FactureRepository.getFactureByVenteId(venteId, session);
    if (!facture) return null;

    const paiements = await PaiementRepository.getPaiementsByVente(venteId, session);
    const montantPaye = paiements
      .filter((p) => p.statut === 'validé' || p.statut === 'valide')
      .reduce((acc, p) => acc + p.montant, 0);

    const montantRestant = Math.max(0, facture.montantTotal - montantPaye);

    let statut = 'impayée';
    if (montantPaye >= facture.montantTotal) {
      statut = 'payée';
    } else if (montantPaye > 0) {
      statut = 'partiellement_payée';
    }

    return await FactureRepository.updateFactureByVenteId(
      venteId,
      {
        montantPaye,
        montantRestant,
        statut,
      },
      session
    );
  };

  /**
   * Enregistre un paiement directement depuis une facture
   * Déclenche de façon atomique le paiement, la mise à jour de la facture et l'écriture dans Finances
   */
  static payerFacture = async (factureId, paymentData) => {
    const facture = await FactureRepository.getFactureById(factureId);
    if (!facture) {
      throw new Error(`Facture ID ${factureId} introuvable`);
    }

    if (facture.statut === 'payée') {
      throw new Error("Cette facture est déjà entièrement payée");
    }

    const payload = {
      ...paymentData,
      facture_id: facture._id,
      vente_id: facture.vente_id?._id || facture.vente_id,
      description: paymentData.description || `Paiement direct Facture N° ${facture.numeroFacture}`,
    };

    return await PaiementService.createPaiement(payload);
  };

  static getFactureById = async (id) => {
    return await FactureRepository.getFactureById(id);
  };

  static getFactureByVenteId = async (venteId) => {
    return await FactureRepository.getFactureByVenteId(venteId);
  };

  static getAllFactures = async (queryParams = {}) => {
    return await FactureRepository.getAllFactures(queryParams);
  };

  static getFacturesByClient = async (clientId) => {
    return await FactureRepository.getFacturesByClient(clientId);
  };

  static deleteFacture = async (id) => {
    const facture = await FactureRepository.getFactureById(id);
    if (!facture) return null;

    const venteId = facture.vente_id?._id || facture.vente_id;
    const paiements = await PaiementRepository.getPaiementsByVente(venteId);
    if (paiements && paiements.length > 0) {
      throw new Error("Impossible de supprimer une facture ayant des paiements enregistrés. Supprimez d'abord les paiements.");
    }

    await FinanceRepository.deleteTransactionsByFactureId(id);
    return await FactureRepository.deleteFacture(id);
  };

  static deleteFactureById = async (id) => {
    return await this.deleteFacture(id);
  };
}

export default FactureService;
