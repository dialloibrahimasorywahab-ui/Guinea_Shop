import PaiementRepository from "./paiement.repositories.js";
import VenteRepository from "../ventes/ventes.repositories.js";
import FactureService from "../factures/factures.service.js";

class PaiementService {
  static createPaiement = async (data) => {
    const { vente_id, montant, modePaiement, statut } = data;

    const vente = await VenteRepository.getVenteById(vente_id);
    if (!vente) {
      throw new Error(`Vente ID ${vente_id} introuvable`);
    }

    const newPaiement = await PaiementRepository.createPaiement({
      vente_id,
      montant,
      modePaiement,
      statut: statut || 'validé',
    });

    // Mettre à jour le statut de la vente si le montant total est atteint
    const paiements = await PaiementRepository.getPaiementsByVente(vente_id);
    const totalPaye = paiements
      .filter((p) => p.statut === 'validé')
      .reduce((acc, p) => acc + p.montant, 0);

    if (totalPaye >= vente.montantTotal && vente.statut !== 'payée') {
      await VenteRepository.updateVente(vente_id, { statut: 'payée' });
    }

    // Synchroniser automatiquement les montants payés/restants et le statut de la facture
    await FactureService.syncFacturePaiements(vente_id);

    return await PaiementRepository.getPaiementById(newPaiement._id);
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

  static updatePaiement = async (id, update) => {
    return await PaiementRepository.updatePaiement(id, update);
  };

  static deletePaiement = async (id) => {
    return await PaiementRepository.deletePaiement(id);
  };

  static deletePaiementById = async (id) => {
    return await PaiementRepository.deletePaiement(id);
  };
}

export default PaiementService;
