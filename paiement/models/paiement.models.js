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
        values: ['espèces', 'espèce', 'carte', 'chèque', 'virement', 'mobile_money', 'Mobile Money', 'autre'],
        message: 'Mode de paiement non valide',
      },
      required: [true, 'Le mode de paiement est requis'],
      default: 'espèces',
    },
    montant: {
      type: Number,
      required: [true, 'Le montant est requis'],
      min: [0.01, 'Le montant doit être supérieur à 0'],
    },
    datePaiement: {
      type: Date,
      default: Date.now,
    },
    statut: {
      type: String,
      enum: ['validé', 'valide', 'échoué', 'echoue', 'en_attente', 'credit'],
      default: 'validé',
    },
  },
  { timestamps: true }
);

const paiementModel = model('Paiement', paiementSchema);

export default paiementModel;
