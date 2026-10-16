import * as yup from 'yup';

export const createFournisseurSchema = yup.object().shape({
  nom: yup.string().trim().required("Le nom du fournisseur est obligatoire"),
  telephone: yup.string().trim().required("Le téléphone du fournisseur est obligatoire"),
  email: yup.string().trim().email("Format d'email invalide"),
  adresse: yup.string().trim().default(''),
});

export const updateFournisseurSchema = yup.object().shape({
  nom: yup.string().trim(),
  telephone: yup.string().trim(),
  email: yup.string().trim().email("Format d'email invalide"),
  adresse: yup.string().trim(),
});
