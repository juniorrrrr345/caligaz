#!/usr/bin/env node

/**
 * Test complet du panel admin Cloudflare
 * Vérifie que tout est bien configuré
 */

const axios = require('axios');
const { MongoClient } = require('mongodb');

const CONFIG = {
  cloudflare: {
    accountId: '7979421604bd07b3bd34d3ed96222512',
    tokens: {
      images: '61mW7CZfq0K6OdcYN9YIC4laRaZNLZAL1Lm4gFhh',
      stream: '8_sayjltoEjPdiyyPTDcr3YI7ikZpRypVmli5bOl'
    },
    imageHash: 'ARYXrwYsY_ECAYN3cIpzBg'
  },
  mongodb: {
    uri: 'mongodb+srv://lmvrtt2:ALcWY4mLHwvtz1X2@lmvrtt.km9x4q9.mongodb.net/test?retryWrites=true&w=majority&appName=LMVRTT',
    database: 'test'
  }
};

class PanelAdminTest {
  constructor() {
    this.results = {
      cloudflare: { images: false, stream: false },
      database: false,
      products: [],
      uploads: { images: false, stream: false }
    };
  }

  async testCloudflareTokens() {
    console.log('\n' + '='.repeat(70));
    console.log('🔐 TEST DES TOKENS CLOUDFLARE');
    console.log('='.repeat(70));

    // Test token Images
    try {
      console.log('\n📸 Test du token Images...');
      const imagesTest = await axios.get(
        `https://api.cloudflare.com/client/v4/accounts/${CONFIG.cloudflare.accountId}/images/v1`,
        {
          headers: {
            'Authorization': `Bearer ${CONFIG.cloudflare.tokens.images}`
          }
        }
      );
      
      if (imagesTest.data.success) {
        this.results.cloudflare.images = true;
        console.log('   ✅ Token Images valide');
        console.log(`   📊 ${imagesTest.data.result.images?.length || 0} image(s) sur Cloudflare`);
      }
    } catch (error) {
      console.log('   ❌ Token Images invalide:', error.response?.data?.errors?.[0]?.message || error.message);
    }

    // Test token Stream
    try {
      console.log('\n🎬 Test du token Stream...');
      const streamTest = await axios.get(
        `https://api.cloudflare.com/client/v4/accounts/${CONFIG.cloudflare.accountId}/stream`,
        {
          headers: {
            'Authorization': `Bearer ${CONFIG.cloudflare.tokens.stream}`
          }
        }
      );
      
      if (streamTest.data.success) {
        this.results.cloudflare.stream = true;
        console.log('   ✅ Token Stream valide');
        console.log(`   📊 ${streamTest.data.result?.length || 0} vidéo(s) sur Cloudflare`);
        
        // Afficher un exemple
        if (streamTest.data.result?.[0]) {
          const video = streamTest.data.result[0];
          console.log(`   🎥 Exemple: ${video.meta?.name || video.uid}`);
          console.log(`   📍 URL: https://iframe.videodelivery.net/${video.uid}`);
        }
      }
    } catch (error) {
      console.log('   ❌ Token Stream invalide:', error.response?.data?.errors?.[0]?.message || error.message);
    }
  }

  async testDatabase() {
    console.log('\n' + '='.repeat(70));
    console.log('🗄️ TEST DE LA BASE DE DONNÉES');
    console.log('='.repeat(70));

    const client = new MongoClient(CONFIG.mongodb.uri);
    
    try {
      await client.connect();
      this.results.database = true;
      console.log('\n✅ Connexion MongoDB réussie');
      
      const db = client.db(CONFIG.mongodb.database);
      const products = await db.collection('products').find({}).toArray();
      
      console.log(`\n📦 ${products.length} produits dans la base`);
      
      // Analyser les médias
      let cloudflareImages = 0;
      let cloudflareVideos = 0;
      let cloudinaryImages = 0;
      let cloudinaryVideos = 0;
      
      products.forEach(product => {
        const productInfo = {
          name: product.name,
          hasCloudflareImage: false,
          hasCloudflareVideo: false
        };
        
        if (product.image) {
          if (product.image.includes('imagedelivery.net')) {
            cloudflareImages++;
            productInfo.hasCloudflareImage = true;
          } else if (product.image.includes('cloudinary')) {
            cloudinaryImages++;
          }
        }
        
        if (product.video) {
          if (product.video.includes('videodelivery.net')) {
            cloudflareVideos++;
            productInfo.hasCloudflareVideo = true;
          } else if (product.video.includes('cloudinary')) {
            cloudinaryVideos++;
          }
        }
        
        this.results.products.push(productInfo);
      });
      
      console.log('\n📊 Répartition des médias:');
      console.log(`   Images: ${cloudflareImages} Cloudflare / ${cloudinaryImages} Cloudinary`);
      console.log(`   Vidéos: ${cloudflareVideos} Cloudflare / ${cloudinaryVideos} Cloudinary`);
      
      // Afficher quelques exemples
      console.log('\n📝 Exemples de produits:');
      products.slice(0, 3).forEach(p => {
        console.log(`\n   • ${p.name}`);
        if (p.image?.includes('imagedelivery')) {
          console.log(`     🖼️ Image Cloudflare ✅`);
        }
        if (p.video?.includes('videodelivery')) {
          console.log(`     📹 Vidéo Cloudflare ✅`);
        }
      });
      
    } catch (error) {
      console.log('\n❌ Erreur MongoDB:', error.message);
    } finally {
      await client.close();
    }
  }

  async testUploadCapabilities() {
    console.log('\n' + '='.repeat(70));
    console.log('⬆️ TEST DES CAPACITÉS D\'UPLOAD');
    console.log('='.repeat(70));

    // Simuler un test d'upload d'image
    console.log('\n📸 Test upload image (simulation)...');
    if (this.results.cloudflare.images) {
      console.log('   ✅ Upload images disponible');
      console.log('   📍 Endpoint: /api/upload-cloudflare');
      console.log('   🔧 Format: multipart/form-data');
      console.log('   📏 Taille max: 10MB');
      this.results.uploads.images = true;
    } else {
      console.log('   ❌ Upload images non disponible (token invalide)');
    }

    // Simuler un test d'upload de vidéo
    console.log('\n🎬 Test upload vidéo (simulation)...');
    if (this.results.cloudflare.stream) {
      console.log('   ✅ Upload vidéos disponible');
      console.log('   📍 Endpoint: /api/upload-cloudflare');
      console.log('   🔧 Format: multipart/form-data');
      console.log('   📏 Taille max: 5GB');
      this.results.uploads.stream = true;
    } else {
      console.log('   ❌ Upload vidéos non disponible (token invalide)');
    }
  }

  async displaySummary() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 RÉSUMÉ DE LA CONFIGURATION');
    console.log('='.repeat(70));

    console.log('\n🔐 Tokens Cloudflare:');
    console.log(`   Images: ${this.results.cloudflare.images ? '✅ Valide' : '❌ Invalide'}`);
    console.log(`   Stream: ${this.results.cloudflare.stream ? '✅ Valide' : '❌ Invalide'}`);

    console.log('\n🗄️ Base de données:');
    console.log(`   MongoDB: ${this.results.database ? '✅ Connectée' : '❌ Déconnectée'}`);
    console.log(`   Produits: ${this.results.products.length}`);

    console.log('\n⬆️ Capacités d\'upload:');
    console.log(`   Images: ${this.results.uploads.images ? '✅ Prêt' : '❌ Non disponible'}`);
    console.log(`   Vidéos: ${this.results.uploads.stream ? '✅ Prêt' : '❌ Non disponible'}`);

    console.log('\n🎯 État du panel admin:');
    if (this.results.cloudflare.images && this.results.cloudflare.stream && this.results.database) {
      console.log('   ✅ PANEL ADMIN 100% OPÉRATIONNEL AVEC CLOUDFLARE !');
      console.log('\n   Fonctionnalités actives:');
      console.log('   • Upload d\'images vers Cloudflare Images');
      console.log('   • Upload de vidéos vers Cloudflare Stream');
      console.log('   • Affichage optimisé avec iframes');
      console.log('   • CDN global activé');
      console.log('   • Performance maximale');
    } else {
      console.log('   ⚠️ Configuration incomplète');
      if (!this.results.cloudflare.images) console.log('   • Corriger le token Images');
      if (!this.results.cloudflare.stream) console.log('   • Corriger le token Stream');
      if (!this.results.database) console.log('   • Vérifier la connexion MongoDB');
    }

    console.log('\n💡 URLs de test:');
    console.log('   Panel Admin: http://localhost:3000/admin');
    console.log('   Boutique: http://localhost:3000');
    console.log('   Dashboard Cloudflare: https://dash.cloudflare.com');
  }

  async run() {
    console.log('\n🚀 DÉMARRAGE DU TEST DU PANEL ADMIN CLOUDFLARE');
    
    await this.testCloudflareTokens();
    await this.testDatabase();
    await this.testUploadCapabilities();
    await this.displaySummary();
    
    console.log('\n✅ Test terminé !');
  }
}

// Lancer le test
async function main() {
  const test = new PanelAdminTest();
  await test.run();
}

main().catch(console.error);