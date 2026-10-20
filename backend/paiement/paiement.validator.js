import * as yup from 'yup';
import { MODES_PAIEMENT, STATUTS_PAIEMENT } from '../common/constants.js';

export const createPaiementSchema = yup.object().shape({
  vente_id: yup.string().trim(),
  facture_id: yup.string().trim(),
  montant: yup
    .number()
    .typeError("Le montant doit être un nombre")
    .positive("Le montant doit être supérieur à 0")
    .required("Le montant est obligatoire"),
  modePaiement: yup
    .string()
    .oneOf(MODES_PAIEMENT, "Mode de paiement non valide")
    .required("Le mode de paiement est obligatoire"),
  statut: yup
    .string()
    .oneOf(STATUTS_PAIEMENT, "Statut de paiement non valide")
    .default('validé'),
  description: yup.string().trim(),
}).test(
  'vente-or-facture',
  'Soit vente_id soit facture_id doit être fourni',
  (value) => !!(value && (value.vente_id || value.facture_id))
);

export const updatePaiementSchema = yup.object().shape({
  montant: yup
    .number()
    .typeError("Le montant doit être un nombre")
    .positive("Le montant doit être supérieur à 0"),
  modePaiement: yup
    .string()
    .oneOf(MODES_PAIEMENT, "Mode de paiement non valide"),
  statut: yup
    .string()
    .oneOf(STATUTS_PAIEMENT, "Statut de paiement non valide"),
  description: yup.string().trim(),
});
