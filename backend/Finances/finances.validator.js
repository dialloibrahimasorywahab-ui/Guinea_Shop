import * as yup from 'yup';

export const createFinanceSchema = yup.object().shape({
  type: yup
    .string()
    .oneOf(['recette', 'dépense'], "Le type doit être 'recette' ou 'dépense'")
    .required("Le type de flux est obligatoire"),
  categorie: yup
    .string()
    .oneOf(
      ['vente', 'achat', 'salaire', 'loyer', 'charge', 'autre'],
      "Catégorie financière invalide"
    )
    .default('autre'),
  montant: yup
    .number()
    .typeError("Le montant doit être un nombre")
    .positive("Le montant doit être supérieur à 0")
    .required("Le montant est obligatoire"),
  modePaiement: yup
    .string()
    .oneOf(
      ['espèces', 'carte', 'chèque', 'virement', 'mobile_money', 'autre'],
      "Mode de paiement invalide"
    )
    .default('espèces'),
  description: yup.string().trim().default(''),
  vente_id: yup.string().trim().nullable(),
  achat_id: yup.string().trim().nullable(),
  paiement_id: yup.string().trim().nullable(),
  user_id: yup.string().trim().nullable(),
});
