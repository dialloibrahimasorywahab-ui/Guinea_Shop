import * as yup from 'yup';

export const ajusterStockSchema = yup.object().shape({
  article_id: yup.string().trim().required("L'ID de l'article est obligatoire"),
  nouvelleQuantite: yup
    .number()
    .typeError("La nouvelle quantité doit être un nombre")
    .min(0, "La quantité ne peut pas être négative")
    .required("La nouvelle quantité est obligatoire"),
  motif: yup.string().trim().default('Ajustement inventaire'),
  user_id: yup.string().trim().nullable(),
});
