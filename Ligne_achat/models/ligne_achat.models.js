import { Schema, model } from 'mongoose';

const ligneAchatSchema = new Schema(
  {
    achat_id: {
      type: Schema.Types.ObjectId,
      ref: 'Achat',
      required: [true, "L'achat est obligatoire"],
    },
    article_id: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, "L'article est obligatoire"],
    },
    quantite: {
      type: Number,
      required: [true, 'La quantité est obligatoire'],
      min: [1, 'La quantité minimale est de 1'],
    },
    prixAchatUnitaire: {
      type: Number,
      required: [true, "Le prix d'achat unitaire est obligatoire"],
      min: [0, "Le prix d'achat ne peut pas être négatif"],
    },
    sousTotal: {
      type: Number,
      required: true,
      min: [0, 'Le sous-total ne peut pas être négatif'],
    },
  },
  { timestamps: true }
);

const ligneAchatModel = model('LigneAchat', ligneAchatSchema);

export default ligneAchatModel;
