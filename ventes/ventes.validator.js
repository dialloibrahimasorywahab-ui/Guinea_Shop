import * as yup from 'yup';

const itemVenteSchema = yup.object().shape({
  article_id: yup.string().trim().required("L'ID de l'article est obligatoire"),
  quantite: yup
    .number()
    .typeError("La quantité doit être un nombre")
    .min(1, "La quantité vendue doit être d'au moins 1")
    .required("La quantité est obligatoire"),
});

export const createVenteSchema = yup.object().shape({
  client_id: yup.string().trim().required("L'ID du client est obligatoire"),
  items: yup
    .array()
    .of(itemVenteSchema)
    .min(1, "La vente doit contenir au moins un article")
    .required("La liste des articles est obligatoire"),
  numeroFacture: yup.string().trim(),
  statut: yup.string().oneOf(['en_attente', 'payée', 'annulée']),
});
