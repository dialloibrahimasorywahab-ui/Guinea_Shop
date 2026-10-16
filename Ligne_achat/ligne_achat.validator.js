import * as yup from 'yup';

export const createLigneAchatSchema = yup.object().shape({
  achat_id: yup.string().trim().required("L'ID de l'achat est obligatoire"),
  article_id: yup.string().trim().required("L'ID de l'article est obligatoire"),
  quantite: yup
    .number()
    .typeError("La quantité doit être un nombre")
    .min(1, "La quantité minimale est de 1")
    .required("La quantité est obligatoire"),
  prixAchatUnitaire: yup
    .number()
    .typeError("Le prix d'achat doit être un nombre")
    .min(0, "Le prix d'achat ne peut pas être négatif")
    .required("Le prix d'achat unitaire est obligatoire"),
});
