import { Schema, model } from 'mongoose';

const achatSchema = new Schema(
  {
    numeroAchat: {
      type: String,
      required: [true, "Le numéro d'achat est obligatoire"],
      unique: true,
      trim: true,
    },
    fournisseur_id: {
      type: Schema.Types.ObjectId,
      ref: 'Fournisseur',
      required: [true, 'Le fournisseur est obligatoire'],
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'utilisateur responsable de l'achat est obligatoire"],
    },
    montantTotal: {
      type: Number,
      required: true,
      min: [0, 'Le montant total ne peut pas être négatif'],
      default: 0,
    },
    statut: {
      type: String,
      enum: {
        values: ['en_attente', 'reçu', 'annulé'],
        message: "Le statut doit être 'en_attente', 'reçu' ou 'annulé'",
      },
      default: 'reçu',
    },
    statutPaiement: {
      type: String,
      enum: {
        values: ['impayé', 'partiellement_payé', 'payé'],
        message: "Le statut de paiement doit être 'impayé', 'partiellement_payé' ou 'payé'",
      },
      default: 'impayé',
    },
    dateAchat: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const achatModel = model('Achat', achatSchema);

export default achatModel;
