import { Schema, model } from 'mongoose';

const ligneVenteSchema = new Schema(
  {
    vente_id: {
      type: Schema.Types.ObjectId,
      ref: 'Vente',
      required: [true, 'La vente est requise'],
    },
    article_id: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, "L'article est requis"],
    },
    quantite: {
      type: Number,
      required: [true, 'La quantité est requise'],
      min: [1, 'La quantité minimale est 1'],
    },
    prixUnitaire: {
      type: Number,
      required: [true, 'Le prix unitaire est requis'],
      min: [0, 'Le prix unitaire ne peut pas être négatif'],
    },
    sousTotal: {
      type: Number,
      required: [true, 'Le sous-total est requis'],
      min: [0, 'Le sous-total ne peut pas être négatif'],
    },
  },
  { timestamps: true }
);

const ligneVenteModel = model('LigneVente', ligneVenteSchema);

export default ligneVenteModel;
