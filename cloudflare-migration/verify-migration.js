#!/usr/bin/env node

/**
 * Script de vérification et monitoring de la migration Cloudflare
 * Vérifie l'état des médias migrés par boutique
 */

const config = require('./config');
const CloudflareAPI = require('./utils/cloudflare-api');
const Database = require('./utils/database');
const axios = require('axios');

class MigrationVerifier {
  constructor() {
    this.cloudflare = new CloudflareAPI(config);
    this.db = new Database(config);
    this.report = {
      boutiques: {},
      errors: [],
      warnings: []
    };
  }

  /**
   * Teste la connectivité avec une URL
   */
  async testUrl(url, type = 'media') {
    try {
      const response = await axios.head(url, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      
      return {
        accessible: response.status === 200,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      return {
        accessible: false,
        error: error.message
      };
    }
  }

  /**
   * Vérifie une boutique spécifique
   */
  async verifyBoutique(boutiqueName) {
    console.log(`\n🔍 Vérification de ${boutiqueName}...`);
    
    const report = {
      name: boutiqueName,
      videos: { total: 0, cloudflare: 0, accessible: 0, errors: [] },
      images: { total: 0, cloudflare: 0, accessible: 0, errors: [] },
      database: { products: 0, migrations: 0 },
      status: 'unknown'
    };

    try {
      // 1. Récupérer les produits de la base de données
      const products = await this.db.getProducts();
      report.database.products = products.length;
      
      console.log(`📦 ${products.length} produits trouvés`);
      
      // 2. Vérifier chaque produit
      for (const product of products) {
        // Vérifier les vidéos
        if (product.video) {
          report.videos.total++;
          
          if (product.video.includes('videodelivery.net')) {
            report.videos.cloudflare++;
            
            // Tester l'accessibilité
            const test = await this.testUrl(product.video);
            if (test.accessible) {
              report.videos.accessible++;
            } else {
              report.videos.errors.push({
                product: product.name,
                url: product.video,
                error: test.error || `Status: ${test.status}`
              });
            }
          }
        }
        
        // Vérifier les images
        if (product.image) {
          report.images.total++;
          
          if (product.image.includes('imagedelivery.net')) {
            report.images.cloudflare++;
            
            // Tester l'accessibilité
            const test = await this.testUrl(product.image);
            if (test.accessible) {
              report.images.accessible++;
            } else {
              report.images.errors.push({
                product: product.name,
                url: product.image,
                error: test.error || `Status: ${test.status}`
              });
            }
          }
        }
      }
      
      // 3. Récupérer l'historique des migrations
      const migrations = await this.db.getMigrationHistory(boutiqueName);
      report.database.migrations = migrations.length;
      
      // 4. Vérifier les médias sur Cloudflare
      console.log(`☁️  Vérification des médias sur Cloudflare...`);
      
      // Lister les vidéos
      const cfVideos = await this.cloudflare.listVideos(boutiqueName);
      console.log(`   📹 ${cfVideos.length} vidéos sur Cloudflare`);
      
      // Lister les images (filtrer par metadata)
      const cfImages = await this.cloudflare.listImages();
      const boutiqueImages = cfImages.filter(img => 
        img.meta?.boutique === boutiqueName ||
        img.filename?.includes(boutiqueName.toLowerCase())
      );
      console.log(`   🖼️  ${boutiqueImages.length} images sur Cloudflare`);
      
      // 5. Déterminer le statut
      const videoMigrationRate = report.videos.total > 0 
        ? (report.videos.cloudflare / report.videos.total * 100).toFixed(1)
        : 100;
      
      const imageMigrationRate = report.images.total > 0
        ? (report.images.cloudflare / report.images.total * 100).toFixed(1)
        : 100;
      
      if (videoMigrationRate == 100 && imageMigrationRate == 100) {
        report.status = 'fully_migrated';
      } else if (videoMigrationRate > 0 || imageMigrationRate > 0) {
        report.status = 'partially_migrated';
      } else {
        report.status = 'not_migrated';
      }
      
      // Ajouter les taux au rapport
      report.migrationRate = {
        videos: `${videoMigrationRate}%`,
        images: `${imageMigrationRate}%`
      };
      
      this.report.boutiques[boutiqueName] = report;
      
      // Afficher le résumé
      this.displayBoutiqueReport(report);
      
    } catch (error) {
      console.error(`❌ Erreur vérification ${boutiqueName}:`, error.message);
      report.status = 'error';
      report.error = error.message;
      this.report.boutiques[boutiqueName] = report;
      this.report.errors.push({
        boutique: boutiqueName,
        error: error.message
      });
    }
  }

  /**
   * Affiche le rapport d'une boutique
   */
  displayBoutiqueReport(report) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📊 Rapport ${report.name}`);
    console.log(`${'─'.repeat(50)}`);
    
    // Statut général
    const statusEmoji = {
      'fully_migrated': '✅',
      'partially_migrated': '⚠️',
      'not_migrated': '❌',
      'error': '🔴',
      'unknown': '❓'
    };
    
    console.log(`\nStatut: ${statusEmoji[report.status]} ${report.status.replace('_', ' ').toUpperCase()}`);
    
    // Vidéos
    console.log(`\n📹 VIDÉOS:`);
    console.log(`   Total: ${report.videos.total}`);
    console.log(`   Sur Cloudflare: ${report.videos.cloudflare} (${report.migrationRate?.videos || '0%'})`);
    console.log(`   Accessibles: ${report.videos.accessible}`);
    if (report.videos.errors.length > 0) {
      console.log(`   ⚠️  Erreurs: ${report.videos.errors.length}`);
      report.videos.errors.slice(0, 3).forEach(err => {
        console.log(`      - ${err.product}: ${err.error}`);
      });
    }
    
    // Images
    console.log(`\n🖼️  IMAGES:`);
    console.log(`   Total: ${report.images.total}`);
    console.log(`   Sur Cloudflare: ${report.images.cloudflare} (${report.migrationRate?.images || '0%'})`);
    console.log(`   Accessibles: ${report.images.accessible}`);
    if (report.images.errors.length > 0) {
      console.log(`   ⚠️  Erreurs: ${report.images.errors.length}`);
      report.images.errors.slice(0, 3).forEach(err => {
        console.log(`      - ${err.product}: ${err.error}`);
      });
    }
    
    // Base de données
    console.log(`\n💾 BASE DE DONNÉES:`);
    console.log(`   Produits: ${report.database.products}`);
    console.log(`   Migrations enregistrées: ${report.database.migrations}`);
  }

  /**
   * Vérifie toutes les boutiques
   */
  async verifyAll() {
    console.log('\n' + '='.repeat(70));
    console.log('🔍 VÉRIFICATION DE LA MIGRATION CLOUDFLARE');
    console.log('='.repeat(70));
    
    const startTime = Date.now();
    
    // Vérifier chaque boutique
    for (const boutiqueName of Object.keys(config.boutiques)) {
      if (config.boutiques[boutiqueName].status !== 'migrated' || boutiqueName === 'CALIGAZ') {
        await this.verifyBoutique(boutiqueName);
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Afficher le résumé final
    this.displayFinalReport(duration);
  }

  /**
   * Affiche le rapport final
   */
  displayFinalReport(duration) {
    console.log('\n' + '='.repeat(70));
    console.log('📊 RAPPORT FINAL DE VÉRIFICATION');
    console.log('='.repeat(70));
    
    // Statistiques globales
    let totalVideos = 0;
    let totalImages = 0;
    let migratedVideos = 0;
    let migratedImages = 0;
    let totalErrors = 0;
    
    Object.values(this.report.boutiques).forEach(boutique => {
      totalVideos += boutique.videos.total;
      totalImages += boutique.images.total;
      migratedVideos += boutique.videos.cloudflare;
      migratedImages += boutique.images.cloudflare;
      totalErrors += boutique.videos.errors.length + boutique.images.errors.length;
    });
    
    console.log('\n📈 STATISTIQUES GLOBALES:');
    console.log(`   📹 Vidéos: ${migratedVideos}/${totalVideos} migrées`);
    console.log(`   🖼️  Images: ${migratedImages}/${totalImages} migrées`);
    console.log(`   ⚠️  Erreurs détectées: ${totalErrors}`);
    console.log(`   ⏱️  Durée de vérification: ${duration}s`);
    
    // Résumé par boutique
    console.log('\n📦 RÉSUMÉ PAR BOUTIQUE:');
    Object.entries(this.report.boutiques).forEach(([name, boutique]) => {
      const statusEmoji = {
        'fully_migrated': '✅',
        'partially_migrated': '⚠️',
        'not_migrated': '❌',
        'error': '🔴',
        'unknown': '❓'
      };
      
      console.log(`   ${statusEmoji[boutique.status]} ${name}: ${boutique.status.replace('_', ' ')}`);
    });
    
    // Recommandations
    if (totalErrors > 0 || migratedVideos < totalVideos || migratedImages < totalImages) {
      console.log('\n💡 RECOMMANDATIONS:');
      
      if (migratedVideos < totalVideos) {
        console.log(`   • ${totalVideos - migratedVideos} vidéos restent à migrer`);
      }
      
      if (migratedImages < totalImages) {
        console.log(`   • ${totalImages - migratedImages} images restent à migrer`);
      }
      
      if (totalErrors > 0) {
        console.log(`   • Vérifier et corriger les ${totalErrors} erreurs d'accessibilité`);
      }
      
      console.log(`   • Exécuter 'npm run migrate:all' pour migrer les médias restants`);
    } else {
      console.log('\n✨ Toutes les migrations sont complètes et fonctionnelles !');
    }
    
    console.log('\n' + '='.repeat(70));
  }

  /**
   * Génère un rapport détaillé en JSON
   */
  async generateDetailedReport(outputFile = 'migration-report.json') {
    const report = {
      timestamp: new Date().toISOString(),
      ...this.report,
      summary: {
        totalBoutiques: Object.keys(this.report.boutiques).length,
        fullyMigrated: Object.values(this.report.boutiques).filter(b => b.status === 'fully_migrated').length,
        partiallyMigrated: Object.values(this.report.boutiques).filter(b => b.status === 'partially_migrated').length,
        notMigrated: Object.values(this.report.boutiques).filter(b => b.status === 'not_migrated').length,
        errors: this.report.errors.length
      }
    };
    
    const fs = require('fs').promises;
    await fs.writeFile(outputFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Rapport détaillé sauvegardé: ${outputFile}`);
    
    return report;
  }
}

// Exécution
async function main() {
  const verifier = new MigrationVerifier();
  
  try {
    await verifier.verifyAll();
    await verifier.generateDetailedReport();
    await verifier.db.close();
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = MigrationVerifier;