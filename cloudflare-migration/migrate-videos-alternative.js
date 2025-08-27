#!/usr/bin/env node

/**
 * Migration alternative des vidéos CALIGAZ
 * Utilise différentes méthodes pour contourner les problèmes d'auth
 */

const axios = require('axios');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  cloudflare: {
    accountId: '7979421604bd07b3bd34d3ed96222512',
    // Essayons avec le token Images qui fonctionne
    apiToken: '61mW7CZfq0K6OdcYN9YIC4laRaZNLZAL1Lm4gFhh'
  },
  mongodb: {
    uri: 'mongodb+srv://lmvrtt2:ALcWY4mLHwvtz1X2@lmvrtt.km9x4q9.mongodb.net/test?retryWrites=true&w=majority&appName=LMVRTT',
    database: 'test'
  },
  boutique: 'CALIGAZ'
};

class VideoMigrationAlternative {
  constructor() {
    this.stats = {
      total: 0,
      processed: 0,
      failed: 0
    };
  }

  /**
   * Télécharge une vidéo localement
   */
  async downloadVideo(url, filename) {
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
      });
      
      const writer = fs.createWriteStream(filename);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Erreur téléchargement:', error.message);
      throw error;
    }
  }

  /**
   * Génère des URLs alternatives pour les vidéos
   */
  generateAlternativeUrls(cloudinaryUrl, productName) {
    // Extraire l'ID de la vidéo Cloudinary
    const match = cloudinaryUrl.match(/\/v(\d+)\/(.+)$/);
    if (!match) return [];
    
    const version = match[1];
    const path = match[2];
    
    // Générer différentes URLs possibles
    return [
      // URL directe MP4
      `https://res.cloudinary.com/dagnmkw0e/video/upload/v${version}/${path}`,
      // URL avec transformation
      `https://res.cloudinary.com/dagnmkw0e/video/upload/q_auto/v${version}/${path}`,
      // URL HLS
      `https://res.cloudinary.com/dagnmkw0e/video/upload/sp_hd/v${version}/${path}.m3u8`
    ];
  }

  /**
   * Migre les vidéos avec méthode alternative
   */
  async migrate() {
    console.log('\n' + '='.repeat(80));
    console.log('🎬 MIGRATION ALTERNATIVE DES VIDÉOS CALIGAZ');
    console.log('='.repeat(80));
    console.log('\n📋 Stratégie:');
    console.log('   1. Lister les vidéos Cloudinary');
    console.log('   2. Générer des URLs alternatives');
    console.log('   3. Proposer des solutions de migration\n');
    
    const client = new MongoClient(CONFIG.mongodb.uri);
    
    try {
      await client.connect();
      console.log('✅ Connecté à MongoDB\n');
      
      const db = client.db(CONFIG.mongodb.database);
      const products = await db.collection('products').find({
        video: { $regex: 'cloudinary' }
      }).toArray();
      
      console.log(`📹 ${products.length} produits avec vidéos Cloudinary trouvés\n`);
      
      // Créer un dossier pour les infos de migration
      const migrationDir = './migration-info-caligaz';
      if (!fs.existsSync(migrationDir)) {
        fs.mkdirSync(migrationDir, { recursive: true });
      }
      
      // Générer un fichier de migration
      const migrationInfo = {
        boutique: CONFIG.boutique,
        date: new Date().toISOString(),
        videos: []
      };
      
      for (const product of products) {
        this.stats.total++;
        
        console.log(`\n📦 Produit: ${product.name}`);
        console.log(`   URL Cloudinary: ${product.video.substring(0, 80)}...`);
        
        // Extraire les infos de la vidéo
        const videoInfo = {
          productId: product._id.toString(),
          productName: product.name,
          originalUrl: product.video,
          alternatives: this.generateAlternativeUrls(product.video, product.name),
          status: 'pending'
        };
        
        // Tester l'accessibilité
        try {
          const response = await axios.head(product.video, { timeout: 5000 });
          if (response.status === 200) {
            videoInfo.accessible = true;
            videoInfo.size = response.headers['content-length'];
            videoInfo.type = response.headers['content-type'];
            console.log(`   ✅ Vidéo accessible (${videoInfo.type})`);
            console.log(`   📏 Taille: ${(videoInfo.size / 1024 / 1024).toFixed(2)} MB`);
          }
        } catch (error) {
          videoInfo.accessible = false;
          console.log(`   ❌ Vidéo non accessible directement`);
        }
        
        migrationInfo.videos.push(videoInfo);
        this.stats.processed++;
      }
      
      // Sauvegarder les infos de migration
      const infoFile = path.join(migrationDir, 'videos-to-migrate.json');
      fs.writeFileSync(infoFile, JSON.stringify(migrationInfo, null, 2));
      
      // Créer un script bash pour télécharger les vidéos
      const downloadScript = migrationInfo.videos
        .filter(v => v.accessible)
        .map(v => `# ${v.productName}\ncurl -o "${migrationDir}/${v.productId}.mp4" "${v.originalUrl}"`)
        .join('\n\n');
      
      fs.writeFileSync(path.join(migrationDir, 'download-videos.sh'), downloadScript);
      
      // Afficher le résumé
      console.log('\n' + '='.repeat(80));
      console.log('📊 RÉSUMÉ');
      console.log('='.repeat(80));
      console.log(`\n📹 Vidéos analysées: ${this.stats.total}`);
      console.log(`✅ Vidéos accessibles: ${migrationInfo.videos.filter(v => v.accessible).length}`);
      console.log(`❌ Vidéos non accessibles: ${migrationInfo.videos.filter(v => !v.accessible).length}`);
      
      console.log('\n📁 Fichiers générés:');
      console.log(`   • ${infoFile}`);
      console.log(`   • ${migrationDir}/download-videos.sh`);
      
      console.log('\n💡 SOLUTIONS PROPOSÉES:');
      console.log('\n1️⃣  OPTION MANUELLE (Recommandée):');
      console.log('   • Télécharger les vidéos avec: bash migration-info-caligaz/download-videos.sh');
      console.log('   • Uploader manuellement sur Cloudflare Stream Dashboard');
      console.log('   • URL: https://dash.cloudflare.com/?to=/:account/stream/videos');
      
      console.log('\n2️⃣  OPTION API (Nécessite un token Stream valide):');
      console.log('   • Créer un token sur: https://dash.cloudflare.com/profile/api-tokens');
      console.log('   • Permissions requises: Account > Cloudflare Stream > Edit');
      console.log('   • Relancer la migration avec le bon token');
      
      console.log('\n3️⃣  OPTION HYBRIDE:');
      console.log('   • Utiliser un service tiers (Zapier, Make) pour automatiser');
      console.log('   • Ou utiliser l\'API Cloudflare avec un compte différent');
      
      // Afficher les URLs des vidéos pour copier-coller
      console.log('\n📋 URLs DES VIDÉOS À MIGRER:');
      migrationInfo.videos.forEach((v, i) => {
        console.log(`\n${i + 1}. ${v.productName}`);
        console.log(`   ${v.originalUrl}`);
      });
      
    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      await client.close();
      console.log('\n🔌 Connexion MongoDB fermée');
    }
  }
}

// Lancer la migration alternative
async function main() {
  const migration = new VideoMigrationAlternative();
  
  try {
    await migration.migrate();
    console.log('\n✨ Analyse terminée !');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}