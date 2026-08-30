import FactureRepository from "./factures.repositories.js";
import VenteRepository from "../ventes/ventes.repositories.js";
import PaiementRepository from "../paiement/paiement.repositories.js";

class FactureService {
  static createFactureFromVente = async (venteId) => {
    const vente = await VenteRepository.getVenteById(venteId);
    if (!vente) {
      throw new Error(`Vente ID ${venteId} introuvable`);
    }

    const existingFacture = await FactureRepository.getFactureByVenteId(venteId);
    if (existingFacture) {
      return existingFacture;
    }

    const paiements = await PaiementRepository.getPaiementsByVente(venteId);
    const montantPaye = paiements
      .filter((p) => p.statut === 'validé')
      .reduce((acc, p) => acc + p.montant, 0);

    const montantRestant = Math.max(0, vente.montantTotal - montantPaye);

    let statut = 'impayée';
    if (montantPaye >= vente.montantTotal) {
      statut = 'payée';
    } else if (montantPaye > 0) {
      statut = 'partiellement_payée';
    }

    return await FactureRepository.createFacture({
      vente_id: vente._id,
      numeroFacture: vente.numeroFacture,
      client_id: vente.client_id._id || vente.client_id,
      montantTotal: vente.montantTotal,
      montantPaye,
      montantRestant,
      statut,
    });
  };

  static syncFacturePaiements = async (venteId) => {
    const facture = await FactureRepository.getFactureByVenteId(venteId);
    if (!facture) return null;

    const paiements = await PaiementRepository.getPaiementsByVente(venteId);
    const montantPaye = paiements
      .filter((p) => p.statut === 'validé')
      .reduce((acc, p) => acc + p.montant, 0);

    const montantRestant = Math.max(0, facture.montantTotal - montantPaye);

    let statut = 'impayée';
    if (montantPaye >= facture.montantTotal) {
      statut = 'payée';
    } else if (montantPaye > 0) {
      statut = 'partiellement_payée';
    }

    return await FactureRepository.updateFactureByVenteId(venteId, {
      montantPaye,
      montantRestant,
      statut,
    });
  };

  static getFactureById = async (id) => {
    return await FactureRepository.getFactureById(id);
  };

  static getFactureByVenteId = async (venteId) => {
    return await FactureRepository.getFactureByVenteId(venteId);
  };

  static getAllFactures = async () => {
    return await FactureRepository.getAllFactures();
  };

  static getFacturesByClient = async (clientId) => {
    return await FactureRepository.getFacturesByClient(clientId);
  };

  static deleteFacture = async (id) => {
    return await FactureRepository.deleteFacture(id);
  };

  static deleteFactureById = async (id) => {
    return await FactureRepository.deleteFacture(id);
  };
}

export default FactureService;
