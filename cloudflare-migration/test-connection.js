#!/usr/bin/env node

/**
 * Script de test des connexions aux APIs
 * Vérifie Cloudflare, MongoDB et Cloudinary
 */

const config = require('./config');
const CloudflareAPI = require('./utils/cloudflare-api');
const Database = require('./utils/database');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

class ConnectionTester {
  constructor() {
    this.results = {
      cloudflare: { status: 'pending', details: {} },
      mongodb: { status: 'pending', details: {} },
      cloudinary: { status: 'pending', details: {} }
    };
  }

  /**
   * Teste la connexion à Cloudflare
   */
  async testCloudflare() {
    console.log('\n🔌 Test de connexion Cloudflare...');
    
    try {
      const cf = new CloudflareAPI(config);
      
      // Tester l'API Stream
      console.log('   📹 Test Cloudflare Stream...');
      const videos = await cf.listVideos();
      this.results.cloudflare.details.stream = {
        success: true,
        videoCount: videos.length
      };
      console.log(`      ✅ Accès OK - ${videos.length} vidéos trouvées`);
      
      // Tester l'API Images
      console.log('   🖼️  Test Cloudflare Images...');
      const images = await cf.listImages(1, 10);
      this.results.cloudflare.details.images = {
        success: true,
        imageCount: images.length
      };
      console.log(`      ✅ Accès OK - ${images.length} images trouvées`);
      
      this.results.cloudflare.status = 'success';
      console.log('   ✅ Cloudflare: Connexion réussie');
      
    } catch (error) {
      this.results.cloudflare.status = 'error';
      this.results.cloudflare.error = error.message;
      console.error('   ❌ Cloudflare: Erreur de connexion');
      console.error(`      ${error.message}`);
    }
  }

  /**
   * Teste la connexion à MongoDB
   */
  async testMongoDB() {
    console.log('\n🔌 Test de connexion MongoDB...');
    
    try {
      const db = new Database(config);
      await db.connect();
      
      // Tester la lecture des produits
      console.log('   📦 Test lecture produits...');
      const products = await db.getProducts();
      this.results.mongodb.details.products = {
        success: true,
        count: products.length
      };
      console.log(`      ✅ ${products.length} produits trouvés`);
      
      // Tester la collection migrations
      console.log('   📝 Test collection migrations...');
      const migrations = await db.getMigrationHistory();
      this.results.mongodb.details.migrations = {
        success: true,
        count: migrations.length
      };
      console.log(`      ✅ ${migrations.length} migrations trouvées`);
      
      await db.close();
      
      this.results.mongodb.status = 'success';
      console.log('   ✅ MongoDB: Connexion réussie');
      
    } catch (error) {
      this.results.mongodb.status = 'error';
      this.results.mongodb.error = error.message;
      console.error('   ❌ MongoDB: Erreur de connexion');
      console.error(`      ${error.message}`);
    }
  }

  /**
   * Teste la connexion à Cloudinary
   */
  async testCloudinary() {
    console.log('\n🔌 Test de connexion Cloudinary (CALIGAZ)...');
    
    try {
      const boutiqueConfig = config.boutiques.CALIGAZ;
      cloudinary.config({
        cloud_name: boutiqueConfig.cloudinary.cloudName,
        api_key: boutiqueConfig.cloudinary.apiKey,
        api_secret: boutiqueConfig.cloudinary.apiSecret
      });
      
      // Tester l'API
      console.log('   📊 Test API Cloudinary...');
      const result = await cloudinary.api.ping();
      
      if (result.status === 'ok') {
        // Récupérer les stats d'usage
        const usage = await cloudinary.api.usage();
        
        this.results.cloudinary.details = {
          success: true,
          cloudName: boutiqueConfig.cloudinary.cloudName,
          plan: usage.plan,
          credits: {
            used: usage.credits?.usage || 0,
            limit: usage.credits?.limit || 0
          },
          storage: {
            used: usage.storage?.usage || 0,
            limit: usage.storage?.limit || 0
          }
        };
        
        console.log(`      ✅ Cloud: ${boutiqueConfig.cloudinary.cloudName}`);
        console.log(`      ✅ Plan: ${usage.plan}`);
        
        this.results.cloudinary.status = 'success';
        console.log('   ✅ Cloudinary: Connexion réussie');
      } else {
        throw new Error('API ping failed');
      }
      
    } catch (error) {
      this.results.cloudinary.status = 'error';
      this.results.cloudinary.error = error.message;
      console.error('   ❌ Cloudinary: Erreur de connexion');
      console.error(`      ${error.message}`);
    }
  }

  /**
   * Teste une URL spécifique
   */
  async testUrl(url, name) {
    console.log(`\n🔗 Test URL ${name}...`);
    
    try {
      const response = await axios.head(url, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      
      if (response.status === 200) {
        console.log(`   ✅ ${name}: Accessible (Status: ${response.status})`);
        return true;
      } else {
        console.log(`   ⚠️  ${name}: Status ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error(`   ❌ ${name}: Non accessible`);
      console.error(`      ${error.message}`);
      return false;
    }
  }

  /**
   * Affiche le résumé
   */
  displaySummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DES TESTS DE CONNEXION');
    console.log('='.repeat(60));
    
    const services = [
      { name: 'Cloudflare', result: this.results.cloudflare },
      { name: 'MongoDB', result: this.results.mongodb },
      { name: 'Cloudinary', result: this.results.cloudinary }
    ];
    
    services.forEach(service => {
      const emoji = service.result.status === 'success' ? '✅' : '❌';
      console.log(`\n${emoji} ${service.name}: ${service.result.status.toUpperCase()}`);
      
      if (service.result.status === 'success' && service.result.details) {
        Object.entries(service.result.details).forEach(([key, value]) => {
          if (typeof value === 'object' && value.success) {
            console.log(`   • ${key}: OK`);
          }
        });
      } else if (service.result.error) {
        console.log(`   Error: ${service.result.error}`);
      }
    });
    
    // Statut global
    const allSuccess = services.every(s => s.result.status === 'success');
    
    console.log('\n' + '-'.repeat(60));
    if (allSuccess) {
      console.log('✅ TOUS LES SERVICES SONT OPÉRATIONNELS');
      console.log('🚀 Prêt pour la migration !');
    } else {
      console.log('⚠️  CERTAINS SERVICES NE SONT PAS ACCESSIBLES');
      console.log('📝 Vérifiez les configurations avant de lancer la migration');
    }
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Lance tous les tests
   */
  async runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TEST DES CONNEXIONS AUX SERVICES');
    console.log('='.repeat(60));
    
    await this.testCloudflare();
    await this.testMongoDB();
    await this.testCloudinary();
    
    // Tester quelques URLs de médias
    console.log('\n📸 Test d\'accessibilité des médias...');
    await this.testUrl('https://iframe.videodelivery.net/', 'Cloudflare Stream');
    await this.testUrl('https://imagedelivery.net/', 'Cloudflare Images');
    
    this.displaySummary();
  }
}

// Exécution
async function main() {
  const tester = new ConnectionTester();
  
  try {
    await tester.runAllTests();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ConnectionTester;