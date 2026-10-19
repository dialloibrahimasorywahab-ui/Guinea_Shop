import * as yup from 'yup';

export const createArticleSchema = yup.object().shape({
  libelle: yup.string().trim().required("Le libellé de l'article est obligatoire"),
  description: yup.string().trim().default(''),
  prixUnitaire: yup
    .number()
    .transform((val, orig) => (orig === '' ? undefined : val))
    .typeError("Le prix unitaire doit être un nombre")
    .min(0, "Le prix unitaire ne peut pas être négatif")
    .required("Le prix unitaire est obligatoire"),
  quantiteEnStock: yup
    .number()
    .transform((val, orig) => (orig === '' ? undefined : val))
    .typeError("La quantité en stock doit être un nombre")
    .integer("La quantité en stock doit être un entier")
    .min(0, "La quantité ne peut pas être négative")
    .default(0),
  seuilAlerte: yup
    .number()
    .transform((val, orig) => (orig === '' ? undefined : val))
    .typeError("Le seuil d'alerte doit être un nombre")
    .integer("Le seuil d'alerte doit être un entier")
    .min(0, "Le seuil d'alerte ne peut pas être négatif")
    .default(5),
  image: yup.string().trim().nullable(),
  taille: yup.string().trim().nullable(),
  couleur: yup.string().trim().nullable(),
  marque: yup.string().trim().nullable(),
  categorie_id: yup.string().trim().nullable().transform((v) => (v === '' ? null : v)),
  fournisseur_id: yup.string().trim().nullable().transform((v) => (v === '' ? null : v)),
});

export const updateArticleSchema = yup.object().shape({
  libelle: yup.string().trim(),
  description: yup.string().trim(),
  prixUnitaire: yup
    .number()
    .transform((val, orig) => (orig === '' ? undefined : val))
    .typeError("Le prix unitaire doit être un nombre")
    .min(0, "Le prix unitaire ne peut pas être négatif"),
  seuilAlerte: yup
    .number()
    .transform((val, orig) => (orig === '' ? undefined : val))
    .typeError("Le seuil d'alerte doit être un nombre")
    .integer("Le seuil d'alerte doit être un entier")
    .min(0, "Le seuil d'alerte ne peut pas être négatif"),
  image: yup.string().trim().nullable(),
  taille: yup.string().trim().nullable(),
  couleur: yup.string().trim().nullable(),
  marque: yup.string().trim().nullable(),
  categorie_id: yup.string().trim().nullable().transform((v) => (v === '' ? null : v)),
  fournisseur_id: yup.string().trim().nullable().transform((v) => (v === '' ? null : v)),
});
