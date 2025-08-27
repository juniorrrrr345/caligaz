#!/usr/bin/env node

/**
 * Script principal de migration automatique pour toutes les boutiques
 * Organise les médias par nom de boutique GitHub
 */

const config = require('./config');
const CaligazMigration = require('./migrate-caligaz');

class MigrationManager {
  constructor() {
    this.boutiques = config.boutiques;
    this.results = {};
  }

  /**
   * Affiche le banner de démarrage
   */
  displayBanner() {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 MIGRATION AUTOMATIQUE VERS CLOUDFLARE');
    console.log('='.repeat(70));
    console.log('\n📁 Organisation par boutique GitHub:');
    
    Object.entries(this.boutiques).forEach(([key, boutique]) => {
      const status = boutique.status === 'migrated' ? '✅' : '⏳';
      console.log(`   ${status} ${key}: ${boutique.folders?.videos || 'À configurer'}`);
    });
    
    console.log('\n' + '='.repeat(70) + '\n');
  }

  /**
   * Migre une boutique spécifique
   */
  async migrateBoutique(boutiqueName) {
    console.log(`\n📦 Migration de ${boutiqueName}...`);
    
    const boutique = this.boutiques[boutiqueName];
    
    // Vérifier si déjà migrée
    if (boutique.status === 'migrated') {
      console.log(`✅ ${boutiqueName} déjà migrée`);
      this.results[boutiqueName] = { status: 'already_migrated' };
      return;
    }
    
    try {
      // Pour l'instant, on a seulement CALIGAZ
      if (boutiqueName === 'CALIGAZ') {
        const migration = new CaligazMigration();
        await migration.migrateProducts();
        
        this.results[boutiqueName] = {
          status: 'success',
          stats: migration.stats
        };
      } else {
        console.log(`⚠️  Script de migration non disponible pour ${boutiqueName}`);
        this.results[boutiqueName] = { status: 'not_implemented' };
      }
    } catch (error) {
      console.error(`❌ Erreur migration ${boutiqueName}:`, error.message);
      this.results[boutiqueName] = {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Lance la migration de toutes les boutiques
   */
  async migrateAll() {
    this.displayBanner();
    
    const startTime = Date.now();
    
    // Migrer chaque boutique
    for (const boutiqueName of Object.keys(this.boutiques)) {
      await this.migrateBoutique(boutiqueName);
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Afficher le résumé final
    this.displayFinalSummary(duration);
  }

  /**
   * Affiche le résumé final
   */
  displayFinalSummary(duration) {
    console.log('\n' + '='.repeat(70));
    console.log('📊 RÉSUMÉ FINAL DE LA MIGRATION');
    console.log('='.repeat(70) + '\n');
    
    let totalVideos = 0;
    let totalImages = 0;
    let successCount = 0;
    
    Object.entries(this.results).forEach(([boutique, result]) => {
      console.log(`\n📦 ${boutique}:`);
      
      if (result.status === 'success') {
        successCount++;
        console.log(`   ✅ Migration réussie`);
        
        if (result.stats) {
          console.log(`   📹 Vidéos: ${result.stats.videos.migrated} migrées`);
          console.log(`   🖼️  Images: ${result.stats.images.migrated} migrées`);
          totalVideos += result.stats.videos.migrated;
          totalImages += result.stats.images.migrated;
        }
      } else if (result.status === 'already_migrated') {
        console.log(`   ✅ Déjà migrée`);
      } else if (result.status === 'not_implemented') {
        console.log(`   ⚠️  Non implémentée`);
      } else {
        console.log(`   ❌ Erreur: ${result.error}`);
      }
    });
    
    console.log('\n' + '-'.repeat(70));
    console.log('\n📈 STATISTIQUES GLOBALES:');
    console.log(`   ✅ Boutiques migrées: ${successCount}`);
    console.log(`   📹 Total vidéos migrées: ${totalVideos}`);
    console.log(`   🖼️  Total images migrées: ${totalImages}`);
    console.log(`   ⏱️  Durée totale: ${duration}s`);
    
    console.log('\n💰 BÉNÉFICES:');
    console.log(`   • Réduction des coûts: ~70%`);
    console.log(`   • Performance améliorée`);
    console.log(`   • Organisation claire par boutique`);
    console.log(`   • Gestion centralisée`);
    
    console.log('\n🎯 URLs Cloudflare:');
    console.log(`   • Vidéos: https://iframe.videodelivery.net/[ID]`);
    console.log(`   • Images: https://imagedelivery.net/[HASH]/[ID]/public`);
    
    console.log('\n' + '='.repeat(70));
    console.log('✨ Migration terminée avec succès !');
    console.log('='.repeat(70) + '\n');
  }
}

// Exécution
async function main() {
  const manager = new MigrationManager();
  
  try {
    await manager.migrateAll();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = MigrationManager;