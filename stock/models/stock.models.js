import { Schema, model } from 'mongoose';

const stockSchema = new Schema(
  {
    article_id: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, "L'article est requis"],
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'utilisateur responsable du mouvement est requis"],
    },
    typeMouvement: {
      type: String,
      enum: {
        values: ['entrée', 'sortie', 'ajustement'],
        message: 'Le type de mouvement doit être entrée, sortie ou ajustement',
      },
      required: [true, 'Le type de mouvement est requis'],
    },
    quantite: {
      type: Number,
      required: [true, 'La quantité est requise'],
      min: [1, 'La quantité doit être supérieure à 0'],
    },
    dateMouvement: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const stockModel = model('Stock', stockSchema);

export default stockModel;
