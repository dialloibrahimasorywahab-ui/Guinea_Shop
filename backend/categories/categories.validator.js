import * as yup from 'yup';

export const createCategorySchema = yup.object().shape({
  nom: yup.string().trim().required("Le nom de la catégorie est obligatoire"),
  description: yup.string().trim().default(''),
});

export const updateCategorySchema = yup.object().shape({
  nom: yup.string().trim(),
  description: yup.string().trim(),
});
