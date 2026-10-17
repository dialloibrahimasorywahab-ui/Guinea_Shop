import 'dotenv/config';
import mongoose from 'mongoose';
import { supportsTransactions } from '../common/db/transaction.js';

const check = async () => {
  await mongoose.connect(process.env.DB_URL || 'mongodb://127.0.0.1:27017/gh_maick');
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  console.log('setName:', hello.setName || 'AUCUN (MongoDB standalone)');
  console.log('supportsTransactions():', await supportsTransactions());
  await mongoose.disconnect();
};

check().catch(console.error);
