import { Schema, model } from 'mongoose';

const articleSchema = new Schema(
  {
    fournisseur_id: {
      type: Schema.Types.ObjectId,
      ref: 'Fournisseur',
      // required: [true, 'Le fournisseur est requis'],
    },
    categorie_id: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    libelle: {
      type: String,
      required: [true, "Le libellé de l'article est requis"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    prixUnitaire: {
      type: Number,
      required: [true, 'Le prix unitaire est requis'],
      min: [0, 'Le prix unitaire ne peut pas être négatif'],
    },
    quantiteEnStock: {
      type: Number,
      required: [true, 'La quantité en stock est requise'],
      min: [0, 'La quantité ne peut pas être négative'],
      default: 0,
    },
    seuilAlerte: {
      type: Number,
      default: 5,
      min: [0, "Le seuil d'alerte ne peut pas être négatif"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const articleModel = model('Article', articleSchema);

export default articleModel;
