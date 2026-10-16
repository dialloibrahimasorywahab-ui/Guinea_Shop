import * as yup from 'yup';

export const genererFactureSchema = yup.object().shape({
  venteId: yup.string().trim().required("L'ID de la vente est obligatoire"),
});

export const payerFactureSchema = yup.object().shape({
  montant: yup
    .number()
    .typeError("Le montant doit être un nombre")
    .positive("Le montant doit être supérieur à 0")
    .required("Le montant est obligatoire"),
  modePaiement: yup
    .string()
    .oneOf(
      ['espèces', 'espèce', 'carte', 'chèque', 'virement', 'mobile_money', 'autre'],
      "Mode de paiement non valide"
    )
    .required("Le mode de paiement est obligatoire"),
  description: yup.string().trim(),
});
