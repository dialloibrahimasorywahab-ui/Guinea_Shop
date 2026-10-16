import { Schema, model } from 'mongoose';

const mouvementStockSchema = new Schema(
  {
    article_id: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, "L'article est obligatoire"],
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'utilisateur responsable du mouvement est obligatoire"],
    },
    typeMouvement: {
      type: String,
      enum: {
        values: ['entrée', 'sortie', 'ajustement'],
        message: "Le type de mouvement doit être 'entrée', 'sortie' ou 'ajustement'",
      },
      required: [true, 'Le type de mouvement est obligatoire'],
    },
    quantite: {
      type: Number,
      required: [true, 'La quantité est obligatoire'],
      min: [1, 'La quantité doit être supérieure à 0'],
    },
    motif: {
      type: String,
      trim: true,
      default: '',
    },
    achat_id: {
      type: Schema.Types.ObjectId,
      ref: 'Achat',
      default: null,
    },
    vente_id: {
      type: Schema.Types.ObjectId,
      ref: 'Vente',
      default: null,
    },
    dateMouvement: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const mouvementStockModel = model('MouvementStock', mouvementStockSchema);

export default mouvementStockModel;
