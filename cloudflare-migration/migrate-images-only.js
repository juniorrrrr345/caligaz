#!/usr/bin/env node

/**
 * Migration Cloudflare Images uniquement pour CALIGAZ
 * Utilise le nouveau token avec les bonnes permissions
 */

const axios = require('axios');
const FormData = require('form-data');
const { MongoClient } = require('mongodb');

const CONFIG = {
  cloudflare: {
    accountId: '7979421604bd07b3bd34d3ed96222512',
    apiToken: '61mW7CZfq0K6OdcYN9YIC4laRaZNLZAL1Lm4gFhh',
    imageAccountHash: 'ARYXrwYsY_ECAYN3cIpzBg'
  },
  mongodb: {
    uri: 'mongodb+srv://lmvrtt2:ALcWY4mLHwvtz1X2@lmvrtt.km9x4q9.mongodb.net/lmvrtt_shop?retryWrites=true&w=majority&appName=LMVRTT',
    database: 'lmvrtt_shop'
  },
  boutique: 'CALIGAZ'
};

class CaligazImageMigration {
  constructor() {
    this.stats = {
      total: 0,
      migrated: 0,
      alreadyCloudflare: 0,
      skipped: 0,
      failed: 0
    };
  }

  /**
   * Upload une image vers Cloudflare Images
   */
  async uploadImageToCloudflare(imageUrl, productName, productId) {
    try {
      const form = new FormData();
      form.append('url', imageUrl);
      
      // Metadata pour organisation
      const metadata = {
        boutique: CONFIG.boutique,
        productName: productName,
        productId: productId,
        originalUrl: imageUrl,
        folder: `${CONFIG.boutique}/images`,
        migratedAt: new Date().toISOString()
      };
      
      form.append('metadata', JSON.stringify(metadata));
      form.append('requireSignedURLs', 'false');
      
      // ID unique pour l'image
      const imageId = `${CONFIG.boutique.toLowerCase()}-${productId}-${Date.now()}`;
      form.append('id', imageId);
      
      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${CONFIG.cloudflare.accountId}/images/v1`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${CONFIG.cloudflare.apiToken}`
          }
        }
      );
      
      if (response.data.success) {
        const result = response.data.result;
        const publicUrl = result.variants.find(v => v.includes('/public')) || result.variants[0];
        
        console.log(`   ✅ Image migrée: ${publicUrl.substring(0, 80)}...`);
        this.stats.migrated++;
        
        return {
          success: true,
          cloudflareId: result.id,
          publicUrl: publicUrl,
          variants: result.variants
        };
      }
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`   ⏭️  Image déjà existante sur Cloudflare`);
        this.stats.skipped++;
        return { success: false, reason: 'duplicate' };
      }
      
      console.error(`   ❌ Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      this.stats.failed++;
      return { success: false, error: error.message };
    }
  }

  /**
   * Migre tous les produits CALIGAZ
   */
  async migrate() {
    console.log('\n' + '='.repeat(70));
    console.log('🖼️  MIGRATION CLOUDFLARE IMAGES - CALIGAZ');
    console.log('='.repeat(70));
    console.log(`\n📁 Organisation: ${CONFIG.boutique}/images`);
    console.log(`🔑 Token: ${CONFIG.cloudflare.apiToken.substring(0, 10)}...`);
    console.log(`📦 Account Hash: ${CONFIG.cloudflare.imageAccountHash}\n`);
    
    // Connexion MongoDB
    const client = new MongoClient(CONFIG.mongodb.uri);
    
    try {
      await client.connect();
      console.log('✅ Connecté à MongoDB\n');
      
      const db = client.db(CONFIG.mongodb.database);
      const products = await db.collection('products').find({}).toArray();
      
      console.log(`📦 ${products.length} produits trouvés\n`);
      
      // Traiter chaque produit
      for (const product of products) {
        if (!product.image) continue;
        
        this.stats.total++;
        
        console.log(`\n📦 Produit: ${product.name}`);
        console.log(`   Image: ${product.image.substring(0, 80)}...`);
        
        // Vérifier si déjà sur Cloudflare
        if (product.image.includes('imagedelivery.net')) {
          console.log(`   ✅ Déjà sur Cloudflare`);
          this.stats.alreadyCloudflare++;
          continue;
        }
        
        // Vérifier si c'est une vraie image Cloudinary
        if (!product.image.includes('cloudinary.com')) {
          console.log(`   ⏭️  Pas une image Cloudinary`);
          this.stats.skipped++;
          continue;
        }
        
        // Migrer l'image
        const result = await this.uploadImageToCloudflare(
          product.image,
          product.name,
          product._id.toString()
        );
        
        // Mettre à jour le produit si migration réussie
        if (result.success) {
          await db.collection('products').updateOne(
            { _id: product._id },
            { $set: { image: result.publicUrl } }
          );
          console.log(`   ✅ Produit mis à jour en base de données`);
        }
        
        // Pause courte entre les uploads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Afficher le résumé
      this.displaySummary();
      
    } catch (error) {
      console.error('❌ Erreur fatale:', error);
    } finally {
      await client.close();
      console.log('\n🔌 Connexion MongoDB fermée');
    }
  }

  /**
   * Affiche le résumé
   */
  displaySummary() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 RÉSUMÉ DE LA MIGRATION');
    console.log('='.repeat(70));
    
    console.log(`\n🖼️  IMAGES CALIGAZ:`);
    console.log(`   Total analysées: ${this.stats.total}`);
    console.log(`   ✅ Migrées: ${this.stats.migrated}`);
    console.log(`   ✅ Déjà sur Cloudflare: ${this.stats.alreadyCloudflare}`);
    console.log(`   ⏭️  Skippées: ${this.stats.skipped}`);
    console.log(`   ❌ Échouées: ${this.stats.failed}`);
    
    if (this.stats.migrated > 0) {
      console.log(`\n💰 BÉNÉFICES:`);
      console.log(`   • ${this.stats.migrated} images migrées vers Cloudflare`);
      console.log(`   • Réduction des coûts: ~70%`);
      console.log(`   • CDN global activé`);
      console.log(`   • Organisation: ${CONFIG.boutique}/images`);
    }
    
    console.log('\n🎯 URLs des images migrées:');
    console.log(`   https://imagedelivery.net/${CONFIG.cloudflare.imageAccountHash}/[IMAGE_ID]/public`);
    
    console.log('\n' + '='.repeat(70));
  }
}

// Lancer la migration
async function main() {
  const migration = new CaligazImageMigration();
  
  try {
    await migration.migrate();
    console.log('\n✨ Migration terminée !');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}