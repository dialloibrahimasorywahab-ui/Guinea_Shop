import { Schema, model } from 'mongoose';

const venteSchema = new Schema(
  {
    client_id: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Le client est requis'],
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'utilisateur vendeur/caissier est requis"],
    },
    numeroFacture: {
      type: String,
      required: [true, 'Le numéro de facture est requis'],
      unique: true,
      trim: true,
    },
    dateVente: {
      type: Date,
      default: Date.now,
    },
    montantTotal: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Le montant total ne peut pas être négatif'],
    },
    statut: {
      type: String,
      enum: ['en_attente', 'payée', 'annulée'],
      default: 'en_attente',
    },
  },
  { timestamps: true }
);

const venteModel = model('Vente', venteSchema);

export default venteModel;
