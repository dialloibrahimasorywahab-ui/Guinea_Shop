import { Schema, model } from 'mongoose';

const fournisseurSchema = new Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom du fournisseur est requis'],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    },
    telephone: {
      type: String,
      required: [true, 'Le téléphone est requis'],
      unique: true,
      trim: true,
    },
    adresse: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const fournisseurModel = model('Fournisseur', fournisseurSchema);

export default fournisseurModel;
