import { Schema, model } from 'mongoose';

const financeSchema = new Schema(
  {
    type: {
      type: String,
      enum: {
        values: ['recette', 'dépense'],
        message: "Le type de flux financier doit être 'recette' ou 'dépense'",
      },
      required: [true, 'Le type de flux financier est obligatoire'],
    },
    categorie: {
      type: String,
      enum: {
        values: ['vente', 'achat', 'salaire', 'loyer', 'charge', 'autre'],
        message: "La catégorie doit être 'vente', 'achat', 'salaire', 'loyer', 'charge' ou 'autre'",
      },
      default: 'autre',
      required: true,
    },
    montant: {
      type: Number,
      required: [true, 'Le montant est obligatoire'],
      min: [0.01, 'Le montant doit être supérieur à 0'],
    },
    modePaiement: {
      type: String,
      enum: ['espèces', 'carte', 'chèque', 'virement', 'mobile_money', 'autre'],
      default: 'espèces',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'utilisateur responsable de la transaction est obligatoire"],
    },
    vente_id: {
      type: Schema.Types.ObjectId,
      ref: 'Vente',
      default: null,
    },
    achat_id: {
      type: Schema.Types.ObjectId,
      ref: 'Achat',
      default: null,
    },
    paiement_id: {
      type: Schema.Types.ObjectId,
      ref: 'Paiement',
      default: null,
    },
    facture_id: {
      type: Schema.Types.ObjectId,
      ref: 'Facture',
      default: null,
    },
    dateTransaction: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const financeModel = model('Finance', financeSchema);

export default financeModel;
