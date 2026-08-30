import { Schema, model } from 'mongoose';

const categorySchema = new Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom de la catégorie est requis'],
      unique: true,
      trim: true,
    },
    description: {
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

const categoryModel = model('Category', categorySchema);

export default categoryModel;
