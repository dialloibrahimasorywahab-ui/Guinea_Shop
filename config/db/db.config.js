import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gh_maick';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connecté avec succès');
  } catch (error) {
    console.error('Erreur de connexion MongoDB :', error.message);
    throw error;
  }
};

export default connectDB;
