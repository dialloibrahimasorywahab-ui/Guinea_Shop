import { Schema, model } from 'mongoose';

const factureSchema = new Schema(
  {
    vente_id: {
      type: Schema.Types.ObjectId,
      ref: 'Vente',
      required: [true, 'La vente associée est requise'],
      unique: true,
    },
    numeroFacture: {
      type: String,
      required: [true, 'Le numéro de facture est requis'],
      unique: true,
      trim: true,
    },
    client_id: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Le client est requis'],
    },
    montantTotal: {
      type: Number,
      required: [true, 'Le montant total est requis'],
      min: [0, 'Le montant total ne peut pas être négatif'],
    },
    montantPaye: {
      type: Number,
      default: 0,
      min: [0, 'Le montant payé ne peut pas être négatif'],
    },
    montantRestant: {
      type: Number,
      required: true,
      min: [0, 'Le montant restant ne peut pas être négatif'],
    },
    statut: {
      type: String,
      enum: ['impayée', 'partiellement_payée', 'payée'],
      default: 'impayée',
    },
    dateEmission: {
      type: Date,
      default: Date.now,
    },
    dateEcheance: {
      type: Date,
    },
  },
  { timestamps: true }
);

const factureModel = model('Facture', factureSchema);

export default factureModel;
