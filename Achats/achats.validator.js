import * as yup from 'yup';

const itemAchatSchema = yup.object().shape({
  article_id: yup.string().trim().required("L'ID de l'article est obligatoire"),
  quantite: yup
    .number()
    .typeError("La quantité doit être un nombre")
    .min(1, "La quantité achetée doit être d'au moins 1")
    .required("La quantité est obligatoire"),
  prixAchatUnitaire: yup
    .number()
    .typeError("Le prix d'achat doit être un nombre")
    .min(0, "Le prix d'achat ne peut pas être négatif")
    .required("Le prix d'achat unitaire est obligatoire"),
});

export const createAchatSchema = yup.object().shape({
  fournisseur_id: yup.string().trim().required("L'ID du fournisseur est obligatoire"),
  items: yup
    .array()
    .of(itemAchatSchema)
    .min(1, "L'achat doit contenir au moins un article")
    .required("La liste des articles achetés est obligatoire"),
  numeroAchat: yup.string().trim(),
  statut: yup.string().oneOf(['en_attente', 'reçu', 'annulé']).default('reçu'),
  statutPaiement: yup.string().oneOf(['impayé', 'partiellement_payé', 'payé']).default('impayé'),
});

export const updateAchatSchema = yup.object().shape({
  statut: yup.string().oneOf(['en_attente', 'reçu', 'annulé']),
  statutPaiement: yup.string().oneOf(['impayé', 'partiellement_payé', 'payé']),
});
