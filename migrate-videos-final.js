#!/usr/bin/env node

/**
 * Migration FINALE des vidéos vers Cloudflare Stream
 * Utilise le token valide fourni
 */

const { MongoClient } = require('mongodb');
const axios = require('axios');
const FormData = require('form-data');

const CONFIG = {
  cloudflare: {
    accountId: '7979421604bd07b3bd34d3ed96222512',
    streamToken: '8_sayjltoEjPdiyyPTDcr3YI7ikZpRypVmli5bOl'
  },
  mongodb: {
    uri: 'mongodb+srv://lmvrtt2:ALcWY4mLHwvtz1X2@lmvrtt.km9x4q9.mongodb.net/test?retryWrites=true&w=majority&appName=LMVRTT',
    database: 'test'
  }
};

class VideoMigrationFinal {
  constructor() {
    this.stats = {
      total: 0,
      migrated: 0,
      failed: 0
    };
  }

  async uploadVideoToStream(videoUrl, productName) {
    try {
      console.log(`   ⬆️  Upload vers Cloudflare Stream...`);
      
      // Utiliser l'API copy pour uploader depuis URL
      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${CONFIG.cloudflare.accountId}/stream/copy`,
        {
          url: videoUrl,
          meta: {
            name: productName,
            boutique: 'CALIGAZ',
            originalUrl: videoUrl,
            uploadedAt: new Date().toISOString()
          },
          requireSignedURLs: false,
          allowedOrigins: ['*']
        },
        {
          headers: {
            'Authorization': `Bearer ${CONFIG.cloudflare.streamToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const videoId = response.data.result.uid;
        const playbackUrl = `https://iframe.videodelivery.net/${videoId}`;
        console.log(`   ✅ Vidéo uploadée: ${playbackUrl}`);
        return playbackUrl;
      } else {
        throw new Error(response.data.errors?.[0]?.message || 'Upload échoué');
      }
    } catch (error) {
      // Si l'API copy échoue, essayer l'upload direct
      if (error.response?.status === 400 || error.response?.status === 403) {
        return await this.uploadVideoDirectly(videoUrl, productName);
      }
      throw error;
    }
  }

  async uploadVideoDirectly(videoUrl, productName) {
    try {
      console.log(`   🔄 Tentative upload direct...`);
      
      // Télécharger la vidéo
      const videoResponse = await axios.get(videoUrl, {
        responseType: 'stream'
      });

      const form = new FormData();
      form.append('file', videoResponse.data, {
        filename: `${productName}.mp4`,
        contentType: 'video/mp4'
      });

      const meta = {
        name: productName,
        boutique: 'CALIGAZ',
        uploadedAt: new Date().toISOString()
      };
      
      form.append('meta', JSON.stringify(meta));

      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${CONFIG.cloudflare.accountId}/stream`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${CONFIG.cloudflare.streamToken}`
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      if (response.data.success) {
        const videoId = response.data.result.uid;
        const playbackUrl = `https://iframe.videodelivery.net/${videoId}`;
        console.log(`   ✅ Vidéo uploadée (direct): ${playbackUrl}`);
        return playbackUrl;
      }
    } catch (error) {
      console.error(`   ❌ Échec upload:`, error.response?.data?.errors || error.message);
      return null;
    }
  }

  async migrate() {
    console.log('\n' + '='.repeat(70));
    console.log('🎬 MIGRATION FINALE DES VIDÉOS VERS CLOUDFLARE STREAM');
    console.log('='.repeat(70));

    const client = new MongoClient(CONFIG.mongodb.uri);
    
    try {
      await client.connect();
      console.log('\n✅ Connecté à MongoDB');
      
      const db = client.db(CONFIG.mongodb.database);
      
      // Récupérer uniquement les produits avec vidéos Cloudinary
      const products = await db.collection('products').find({
        video: { $regex: 'cloudinary' }
      }).toArray();
      
      console.log(`\n📹 ${products.length} vidéos Cloudinary à migrer\n`);
      
      for (const product of products) {
        this.stats.total++;
        
        console.log(`\n📦 Produit: ${product.name}`);
        console.log(`   URL Cloudinary: ${product.video.substring(0, 80)}...`);
        
        const newVideoUrl = await this.uploadVideoToStream(product.video, product.name);
        
        if (newVideoUrl) {
          // Mettre à jour le produit dans la base
          await db.collection('products').updateOne(
            { _id: product._id },
            { $set: { video: newVideoUrl } }
          );
          
          console.log(`   ✅ Base de données mise à jour`);
          this.stats.migrated++;
        } else {
          console.log(`   ❌ Migration échouée`);
          this.stats.failed++;
        }
        
        // Pause entre les uploads
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Afficher le résumé
      console.log('\n' + '='.repeat(70));
      console.log('📊 RÉSUMÉ DE LA MIGRATION');
      console.log('='.repeat(70));
      console.log(`\n📹 Vidéos traitées: ${this.stats.total}`);
      console.log(`✅ Migrées avec succès: ${this.stats.migrated}`);
      console.log(`❌ Échecs: ${this.stats.failed}`);
      
      if (this.stats.migrated > 0) {
        console.log('\n🎉 Les vidéos sont maintenant sur Cloudflare Stream !');
        console.log('   URLs format: https://iframe.videodelivery.net/[VIDEO_ID]');
      }
      
    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      await client.close();
      console.log('\n🔌 Connexion MongoDB fermée');
    }
  }
}

// Lancer la migration
async function main() {
  const migration = new VideoMigrationFinal();
  await migration.migrate();
}

main().catch(console.error);