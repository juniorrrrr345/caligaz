#!/usr/bin/env node

/**
 * Script de migration V2 - Focus sur les médias réels
 * Gestion améliorée des erreurs
 */

const config = require('./config');
const CloudflareAPI = require('./utils/cloudflare-api');
const Database = require('./utils/database');
const axios = require('axios');

class CaligazMigrationV2 {
  constructor() {
    this.cloudflare = new CloudflareAPI(config);
    this.db = new Database(config);
    this.boutique = 'CALIGAZ';
    this.stats = {
      videos: { total: 0, migrated: 0, failed: 0, skipped: 0, alreadyCloudflare: 0 },
      images: { total: 0, migrated: 0, failed: 0, skipped: 0, alreadyCloudflare: 0 }
    };
  }

  /**
   * Vérifie si une URL est déjà sur Cloudflare
   */
  isCloudflareUrl(url) {
    if (!url) return false;
    return url.includes('videodelivery.net') || url.includes('imagedelivery.net');
  }

  /**
   * Vérifie si une URL est valide et accessible
   */
  async isValidMediaUrl(url) {
    try {
      // Filtrer les URLs non supportées
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        console.log('   ⚠️  YouTube non supporté pour migration directe');
        return false;
      }
      
      if (url.includes('picsum.photos')) {
        console.log('   ⚠️  Picsum est un service de placeholder');
        return false;
      }

      // Vérifier si l'URL est accessible
      const response = await axios.head(url, {
        timeout: 5000,
        validateStatus: (status) => status < 400
      });
      
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Migre une vidéo vers Cloudflare Stream
   */
  async migrateVideo(videoUrl, productName) {
    try {
      console.log(`\n📹 Analyse vidéo: ${productName}`);
      
      // Vérifier si déjà sur Cloudflare
      if (this.isCloudflareUrl(videoUrl)) {
        console.log(`   ✅ Déjà sur Cloudflare: ${videoUrl.substring(0, 60)}...`);
        this.stats.videos.alreadyCloudflare++;
        return videoUrl; // Pas besoin de migrer
      }

      // Vérifier si l'URL est valide
      const isValid = await this.isValidMediaUrl(videoUrl);
      if (!isValid) {
        console.log(`   ⏭️  URL non valide ou non accessible`);
        this.stats.videos.skipped++;
        return null;
      }
      
      // Vérifier si déjà migré dans notre base
      const existing = await this.db.isMediaMigrated(videoUrl, 'video');
      if (existing) {
        console.log(`   ⏭️  Déjà migrée précédemment: ${existing.cloudflareUrl}`);
        this.stats.videos.skipped++;
        return existing.cloudflareUrl;
      }
      
      // Upload vers Cloudflare Stream
      const metadata = {
        name: `${this.boutique}-${productName}`,
        boutique: this.boutique,
        folder: `${this.boutique}/videos`,
        originalUrl: videoUrl,
        productName: productName,
        migratedAt: new Date().toISOString()
      };
      
      console.log(`   ⬆️  Upload vers Cloudflare Stream...`);
      const result = await this.cloudflare.uploadVideoFromUrl(videoUrl, metadata);
      
      if (result.success) {
        // Sauvegarder la migration
        await this.db.saveMigration({
          boutique: this.boutique,
          type: 'video',
          productName: productName,
          originalUrl: videoUrl,
          cloudflareUrl: result.playbackUrl,
          cloudflareId: result.videoId,
          thumbnail: result.thumbnail,
          metadata: metadata
        });
        
        console.log(`   ✅ Vidéo migrée: ${result.playbackUrl}`);
        this.stats.videos.migrated++;
        return result.playbackUrl;
      }
    } catch (error) {
      console.error(`   ❌ Erreur: ${error.message}`);
      this.stats.videos.failed++;
      return null;
    }
  }

  /**
   * Migre une image (avec gestion d'erreur améliorée)
   */
  async migrateImage(imageUrl, productName) {
    try {
      console.log(`\n🖼️  Analyse image: ${productName}`);
      
      // Vérifier si déjà sur Cloudflare
      if (this.isCloudflareUrl(imageUrl)) {
        console.log(`   ✅ Déjà sur Cloudflare: ${imageUrl.substring(0, 60)}...`);
        this.stats.images.alreadyCloudflare++;
        return imageUrl; // Pas besoin de migrer
      }

      // Pour l'instant, on skip les images car le service n'est pas activé
      console.log(`   ⚠️  Cloudflare Images non activé - conservation de l'URL actuelle`);
      this.stats.images.skipped++;
      return imageUrl;
      
    } catch (error) {
      console.error(`   ❌ Erreur: ${error.message}`);
      this.stats.images.failed++;
      return null;
    }
  }

  /**
   * Migre tous les produits
   */
  async migrateProducts() {
    try {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`🚀 MIGRATION V2 - CALIGAZ vers Cloudflare`);
      console.log(`${'='.repeat(70)}`);
      console.log(`\n📁 Organisation: ${this.boutique}/videos et ${this.boutique}/images`);
      console.log(`⚡ Focus sur les médias réels et accessibles\n`);
      
      // Récupérer tous les produits
      const products = await this.db.getProducts();
      console.log(`📦 ${products.length} produits trouvés dans la base de données\n`);
      
      // Analyser d'abord les médias
      let cloudinaryCount = 0;
      let cloudflareCount = 0;
      let otherCount = 0;
      
      products.forEach(product => {
        if (product.video) {
          if (this.isCloudflareUrl(product.video)) cloudflareCount++;
          else if (product.video.includes('cloudinary')) cloudinaryCount++;
          else otherCount++;
        }
        if (product.image) {
          if (this.isCloudflareUrl(product.image)) cloudflareCount++;
          else if (product.image.includes('cloudinary')) cloudinaryCount++;
          else otherCount++;
        }
      });
      
      console.log(`📊 Analyse des médias:`);
      console.log(`   • Cloudinary: ${cloudinaryCount} médias`);
      console.log(`   • Cloudflare: ${cloudflareCount} médias (déjà migrés)`);
      console.log(`   • Autres sources: ${otherCount} médias\n`);
      
      // Traiter chaque produit
      for (const product of products) {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`📦 Produit: ${product.name}`);
        console.log(`${'='.repeat(50)}`);
        
        let updated = false;
        const updates = {};
        
        // Traiter la vidéo
        if (product.video) {
          this.stats.videos.total++;
          const newVideoUrl = await this.migrateVideo(product.video, product.name);
          if (newVideoUrl && newVideoUrl !== product.video) {
            updates.video = newVideoUrl;
            updated = true;
          }
        }
        
        // Traiter l'image
        if (product.image) {
          this.stats.images.total++;
          const newImageUrl = await this.migrateImage(product.image, product.name);
          // Pour l'instant on garde les images existantes
        }
        
        // Mettre à jour le produit si nécessaire
        if (updated) {
          const success = await this.db.updateProduct(product._id, updates);
          if (success) {
            console.log(`\n✅ Produit mis à jour en base de données`);
          }
        }
        
        // Pause courte entre les produits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Afficher le résumé
      this.displaySummary();
      
    } catch (error) {
      console.error('❌ Erreur migration:', error);
      throw error;
    } finally {
      await this.db.close();
    }
  }

  /**
   * Affiche le résumé
   */
  displaySummary() {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📊 RÉSUMÉ DE LA MIGRATION V2 - ${this.boutique}`);
    console.log(`${'='.repeat(70)}\n`);
    
    console.log(`📹 VIDÉOS:`);
    console.log(`   Total analysées: ${this.stats.videos.total}`);
    console.log(`   ✅ Migrées: ${this.stats.videos.migrated}`);
    console.log(`   ✅ Déjà sur Cloudflare: ${this.stats.videos.alreadyCloudflare}`);
    console.log(`   ⏭️  Skippées: ${this.stats.videos.skipped}`);
    console.log(`   ❌ Échouées: ${this.stats.videos.failed}\n`);
    
    console.log(`🖼️  IMAGES:`);
    console.log(`   Total analysées: ${this.stats.images.total}`);
    console.log(`   ✅ Déjà sur Cloudflare: ${this.stats.images.alreadyCloudflare}`);
    console.log(`   ⏭️  En attente (Images non activé): ${this.stats.images.skipped}`);
    
    const totalMigrated = this.stats.videos.migrated + this.stats.images.migrated;
    const totalCloudflare = this.stats.videos.alreadyCloudflare + this.stats.images.alreadyCloudflare;
    
    console.log(`\n📈 RÉSULTAT:`);
    console.log(`   • ${totalMigrated} nouveaux médias migrés`);
    console.log(`   • ${totalCloudflare} médias déjà sur Cloudflare`);
    
    if (this.stats.videos.migrated > 0) {
      console.log(`\n💰 ÉCONOMIES:`);
      console.log(`   • Réduction des coûts: ~70% sur les médias migrés`);
      console.log(`   • Performance CDN Cloudflare activée`);
    }
    
    console.log(`\n💡 NOTES:`);
    console.log(`   • Cloudflare Stream: ✅ Opérationnel`);
    console.log(`   • Cloudflare Images: ⚠️  Activation requise sur le compte`);
    console.log(`   • Les URLs YouTube et placeholders sont ignorées`);
    
    console.log(`\n${'='.repeat(70)}\n`);
  }
}

// Exécution
async function main() {
  const migration = new CaligazMigrationV2();
  
  try {
    await migration.migrateProducts();
    console.log('✨ Migration V2 terminée !');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CaligazMigrationV2;