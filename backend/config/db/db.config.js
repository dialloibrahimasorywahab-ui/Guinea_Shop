import mongoose from 'mongoose';

/**
 * Établit la connexion à la base de données MongoDB
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async () => {
  const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/gh_maick';
  try {
    const conn = await mongoose.connect(dbUrl);
    console.log(`✅ Connexion MongoDB réussie sur : ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ Échec de la connexion à MongoDB :', error.message);
    throw error;
  }
};

export default connectDB;
