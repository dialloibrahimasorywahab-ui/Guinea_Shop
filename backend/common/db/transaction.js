import mongoose from 'mongoose';

let transactionsSupported; // Mis en cache après le premier appel

/**
 * Vérifie si le serveur MongoDB supporte les transactions (Replica Set ou Sharded Cluster)
 */
export const supportsTransactions = async () => {
  if (transactionsSupported !== undefined) return transactionsSupported;
  try {
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    // setName : replica set ; msg === 'isdbgrid' : cluster shardé (mongos)
    transactionsSupported = Boolean(hello.setName) || hello.msg === 'isdbgrid';
  } catch (error) {
    // Repli pour les anciennes versions de MongoDB sans commande hello
    try {
      const isMaster = await mongoose.connection.db.admin().command({ isMaster: 1 });
      transactionsSupported = Boolean(isMaster.setName) || isMaster.msg === 'isdbgrid';
    } catch {
      transactionsSupported = false;
    }
  }
  return transactionsSupported;
};

/**
 * Exécute work(session) dans une transaction avec relance automatique en cas
 * de conflit d'écriture. session vaut null si MongoDB est un nœud isolé en développement.
 */
export const runInTransaction = async (work) => {
  const isSupported = await supportsTransactions();

  if (!isSupported) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error("MongoDB doit être configuré en Replica Set (transactions ACID requises en production).");
    }
    // En développement local sans replica set : repli propre sans session
    return await work(null);
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};

export default runInTransaction;
