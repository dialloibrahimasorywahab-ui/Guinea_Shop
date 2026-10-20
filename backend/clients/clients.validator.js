import * as yup from 'yup';

export const createClientSchema = yup.object().shape({
  nom: yup.string().trim().required("Le nom du client est obligatoire"),
  prenom: yup.string().trim().required("Le prénom du client est obligatoire"),
  telephone: yup.string().trim().required("Le numéro de téléphone est obligatoire"),
  email: yup.string().trim().email("Format d'email invalide"),
  adresse: yup.string().trim().default(''),
});

export const updateClientSchema = yup.object().shape({
  nom: yup.string().trim(),
  prenom: yup.string().trim(),
  telephone: yup.string().trim(),
  email: yup.string().trim().email("Format d'email invalide"),
  adresse: yup.string().trim(),
});
