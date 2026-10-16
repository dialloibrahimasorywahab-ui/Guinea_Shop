import * as yup from 'yup';

export const createUserSchema = yup.object().shape({
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
    .min(6, "Le mot de passe doit comporter au moins 6 caractères")
    .required("Le mot de passe est obligatoire"),
  role: yup
    .string()
    .oneOf(['admin', 'gestionnaire', 'caissier', 'client'], "Rôle non reconnu")
    .default('client'),
});

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .email("Format d'email invalide")
    .required("L'email est obligatoire"),
  password: yup.string().required("Le mot de passe est obligatoire"),
});

export const updateUserSchema = yup.object().shape({
  nom: yup.string().trim(),
  prenom: yup.string().trim(),
  email: yup.string().trim().email("Format d'email invalide"),
  telephone: yup.string().trim(),
  password: yup.string().min(6, "Le mot de passe doit comporter au moins 6 caractères"),
  role: yup.string().oneOf(['admin', 'gestionnaire', 'caissier', 'client']),
  isActive: yup.boolean(),
});
