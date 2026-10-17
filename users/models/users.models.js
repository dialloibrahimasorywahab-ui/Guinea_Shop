import { Schema, model } from 'mongoose';
import crypto from 'crypto';

const userSchema = new Schema(
  {
    login: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    nom: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    prenom: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
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
    role: {
      type: String,
      enum: ['admin', 'gestionnaire', 'caissier', 'client'],
      default: 'client',
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.statics.hashPassword = function (plainPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plainPassword, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

userSchema.statics.comparePassword = function (plainPassword, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(plainPassword, salt, 1000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
};

const userModel = model('User', userSchema);

export default userModel;

