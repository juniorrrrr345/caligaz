import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Configuration MongoDB - URI depuis les variables d'environnement
  const MONGODB_URI = process.env.MONGODB_URI || 
    'mongodb+srv://harigon265:reina@reina.lwzsfti.mongodb.net/reinaplug?retryWrites=true&w=majority&appName=reina';

  console.log('🔗 Connexion MongoDB avec URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

  if (!MONGODB_URI) {
    throw new Error('⚠️ Impossible de se connecter à MongoDB');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Fonction pour l'API (MongoDB client direct)
export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI || 
    'mongodb+srv://harigon265:reina@reina.lwzsfti.mongodb.net/reinaplug?retryWrites=true&w=majority&appName=reina';

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  
  return {
    client,
    db: client.db('reinaplug')
  };
}

export default connectDB;