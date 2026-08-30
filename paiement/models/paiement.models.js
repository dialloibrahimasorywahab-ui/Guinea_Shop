import { Schema, model } from 'mongoose';

const paiementSchema = new Schema(
  {
    vente_id: {
      type: Schema.Types.ObjectId,
      ref: 'Vente',
      required: [true, 'La vente associée est requise'],
    },
    modePaiement: {
      type: String,
      enum: {
        values: ['espèce', 'carte', 'chèque', 'virement'],
        message: 'Le mode de paiement doit être espèce, carte, chèque ou virement',
      },
      required: [true, 'Le mode de paiement est requis'],
    },
    montant: {
      type: Number,
      required: [true, 'Le montant est requis'],
      min: [0, 'Le montant ne peut pas être négatif'],
    },
    datePaiement: {
      type: Date,
      default: Date.now,
    },
    statut: {
      type: String,
      enum: ['valide', 'echoue', 'en_attente'],
      default: 'en_attente',
    },
  },
  { timestamps: true }
);

const paiementModel = model('Paiement', paiementSchema);

export default paiementModel;
