import * as yup from 'yup';

const ligneVenteValidationSchema = yup.object().shape({
  article_id: yup.string().required("L'ID de l'article est requis"),
  quantite: yup
    .number()
    .positive("La quantité doit être supérieure à 0")
    .required("La quantité est requise"),
});

export default ligneVenteValidationSchema;