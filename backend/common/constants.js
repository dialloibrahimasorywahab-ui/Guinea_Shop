/**
 * Constantes partagées pour l'ensemble du système GH_Maick (Paiements, Facturation, Trésorerie)
 */

export const MODES_PAIEMENT = [
  'espèces',
  'carte',
  'chèque',
  'virement',
  'mobile_money',
  'autre',
];

export const STATUTS_PAIEMENT = [
  'validé',
  'échoué',
  'en_attente',
];

export const STATUTS_FACTURE = [
  'impayée',
  'partiellement_payée',
  'payée',
  'annulée',
];

export const STATUTS_VENTE = [
  'en_attente',
  'payée',
  'annulée',
];

export const STATUTS_ACHAT = [
  'commandé',
  'en_attente',
  'reçu',
  'annulé',
];

export const STATUTS_PAIEMENT_ACHAT = [
  'impayé',
  'partiellement_payé',
  'payé',
];

export const ROLES_UTILISATEUR = [
  'admin',
  'gestionnaire',
  'caissier',
  'client',
];
