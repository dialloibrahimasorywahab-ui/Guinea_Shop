import * as yup from 'yup';

export const createArticleSchema = yup.object().shape({
  libelle: yup.string().trim().required("Le libellé de l'article est obligatoire"),
  description: yup.string().trim().default(''),
  prixUnitaire: yup
    .number()
    .typeError("Le prix unitaire doit être un nombre")
    .min(0, "Le prix unitaire ne peut pas être négatif")
    .required("Le prix unitaire est obligatoire"),
  quantiteEnStock: yup
    .number()
    .typeError("La quantité en stock doit être un nombre")
    .min(0, "La quantité ne peut pas être négative")
    .default(0),
  seuilAlerte: yup
    .number()
    .typeError("Le seuil d'alerte doit être un nombre")
    .min(0, "Le seuil d'alerte ne peut pas être négatif")
    .default(5),
  categorie_id: yup.string().trim().nullable(),
  fournisseur_id: yup.string().trim().nullable(),
});

export const updateArticleSchema = yup.object().shape({
  libelle: yup.string().trim(),
  description: yup.string().trim(),
  prixUnitaire: yup
    .number()
    .typeError("Le prix unitaire doit être un nombre")
    .min(0, "Le prix unitaire ne peut pas être négatif"),
  quantiteEnStock: yup
    .number()
    .typeError("La quantité en stock doit être un nombre")
    .min(0, "La quantité ne peut pas être négative"),
  seuilAlerte: yup
    .number()
    .typeError("Le seuil d'alerte doit être un nombre")
    .min(0, "Le seuil d'alerte ne peut pas être négatif"),
  categorie_id: yup.string().trim().nullable(),
  fournisseur_id: yup.string().trim().nullable(),
});
