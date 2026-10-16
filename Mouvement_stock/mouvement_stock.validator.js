import * as yup from 'yup';

export const createMouvementStockSchema = yup.object().shape({
  article_id: yup.string().trim().required("L'ID de l'article est obligatoire"),
  typeMouvement: yup
    .string()
    .oneOf(
      ['entrée', 'sortie', 'ajustement'],
      "Le type de mouvement doit être 'entrée', 'sortie' ou 'ajustement'"
    )
    .required("Le type de mouvement est obligatoire"),
  quantite: yup
    .number()
    .typeError("La quantité doit être un nombre")
    .min(1, "La quantité doit être supérieure à 0")
    .required("La quantité est obligatoire"),
  motif: yup.string().trim().default(''),
  achat_id: yup.string().trim().nullable(),
  vente_id: yup.string().trim().nullable(),
  user_id: yup.string().trim().nullable(),
});
