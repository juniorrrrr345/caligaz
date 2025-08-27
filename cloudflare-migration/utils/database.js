/**
 * Utilitaires pour la base de données MongoDB
 */

const { MongoClient } = require('mongodb');

class Database {
  constructor(config) {
    this.config = config;
    this.client = null;
    this.db = null;
  }

  /**
   * Connexion à MongoDB
   */
  async connect() {
    try {
      if (!this.client) {
        this.client = new MongoClient(this.config.mongodb.uri);
        await this.client.connect();
        this.db = this.client.db(this.config.mongodb.database);
        console.log('✅ Connecté à MongoDB');
      }
      return this.db;
    } catch (error) {
      console.error('❌ Erreur connexion MongoDB:', error.message);
      throw error;
    }
  }

  /**
   * Récupère tous les produits
   */
  async getProducts(boutique = null) {
    try {
      await this.connect();
      const collection = this.db.collection(this.config.mongodb.collections.products);
      
      const query = boutique ? { boutique } : {};
      const products = await collection.find(query).toArray();
      
      return products;
    } catch (error) {
      console.error('❌ Erreur récupération produits:', error.message);
      throw error;
    }
  }

  /**
   * Met à jour un produit
   */
  async updateProduct(productId, updates) {
    try {
      await this.connect();
      const collection = this.db.collection(this.config.mongodb.collections.products);
      
      const result = await collection.updateOne(
        { _id: productId },
        { $set: updates }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('❌ Erreur mise à jour produit:', error.message);
      throw error;
    }
  }

  /**
   * Enregistre une migration
   */
  async saveMigration(migration) {
    try {
      await this.connect();
      const collection = this.db.collection(this.config.mongodb.collections.migrations);
      
      const result = await collection.insertOne({
        ...migration,
        createdAt: new Date()
      });
      
      return result.insertedId;
    } catch (error) {
      console.error('❌ Erreur sauvegarde migration:', error.message);
      throw error;
    }
  }

  /**
   * Récupère l'historique des migrations
   */
  async getMigrationHistory(boutique = null) {
    try {
      await this.connect();
      const collection = this.db.collection(this.config.mongodb.collections.migrations);
      
      const query = boutique ? { boutique } : {};
      const migrations = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      
      return migrations;
    } catch (error) {
      console.error('❌ Erreur récupération historique:', error.message);
      throw error;
    }
  }

  /**
   * Vérifie si un média a déjà été migré
   */
  async isMediaMigrated(mediaUrl, type) {
    try {
      await this.connect();
      const collection = this.db.collection(this.config.mongodb.collections.migrations);
      
      const migration = await collection.findOne({
        originalUrl: mediaUrl,
        type: type
      });
      
      return migration !== null ? migration : false;
    } catch (error) {
      console.error('❌ Erreur vérification migration:', error.message);
      throw error;
    }
  }

  /**
   * Ferme la connexion
   */
  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('🔌 Connexion MongoDB fermée');
    }
  }
}

module.exports = Database;