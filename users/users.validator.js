import * as yup from 'yup';

export const createUserSchema = yup.object().shape({
  login: yup
    .string()
    .trim()
    .min(3, "Le login doit comporter au moins 3 caractères"),
  nom: yup.string().trim().required("Le nom est obligatoire"),
  prenom: yup.string().trim().required("Le prénom est obligatoire"),
  email: yup
    .string()
    .trim()
    .email("Format d'email invalide")
    .required("L'email est obligatoire"),
  telephone: yup.string().trim().required("Le téléphone est obligatoire"),
  password: yup
    .string()
    .min(8, "Le mot de passe doit comporter au moins 8 caractères")
    .required("Le mot de passe est obligatoire"),
  role: yup
    .string()
    .oneOf(['admin', 'gestionnaire', 'caissier', 'client'], "Rôle non reconnu")
    .default('client'),
});

export const updateUserSchema = yup.object().shape({
  login: yup.string().trim().min(3, "Le login doit comporter au moins 3 caractères"),
  nom: yup.string().trim(),
  prenom: yup.string().trim(),
  email: yup.string().trim().email("Format d'email invalide"),
  telephone: yup.string().trim(),
  password: yup.string().min(8, "Le mot de passe doit comporter au moins 8 caractères"),
  role: yup.string().oneOf(['admin', 'gestionnaire', 'caissier', 'client']),
  isActive: yup.boolean(),
});
