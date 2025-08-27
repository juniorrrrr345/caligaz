#!/usr/bin/env node

/**
 * Script de migration des médias CALIGAZ vers Cloudflare
 * Organisation par boutique : CALIGAZ/videos et CALIGAZ/images
 */

const config = require('./config');
const CloudflareAPI = require('./utils/cloudflare-api');
const Database = require('./utils/database');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

// Configuration Cloudinary pour CALIGAZ
const boutiqueConfig = config.boutiques.CALIGAZ;
cloudinary.config({
  cloud_name: boutiqueConfig.cloudinary.cloudName,
  api_key: boutiqueConfig.cloudinary.apiKey,
  api_secret: boutiqueConfig.cloudinary.apiSecret
});

class CaligazMigration {
  constructor() {
    this.cloudflare = new CloudflareAPI(config);
    this.db = new Database(config);
    this.boutique = 'CALIGAZ';
    this.stats = {
      videos: { total: 0, migrated: 0, failed: 0, skipped: 0 },
      images: { total: 0, migrated: 0, failed: 0, skipped: 0 }
    };
  }

  /**
   * Extrait l'URL Cloudinary depuis différents formats
   */
  extractCloudinaryUrl(url) {
    if (!url) return null;
    
    // Si c'est déjà une URL Cloudflare, on skip
    if (url.includes('videodelivery.net') || url.includes('imagedelivery.net')) {
      return null;
    }
    
    // Formats possibles de Cloudinary
    const patterns = [
      /https?:\/\/res\.cloudinary\.com\/[^\/]+\/[^\/]+\/[^\/]+\/[^\/]+\/(.+)/,
      /https?:\/\/res\.cloudinary\.com\/.+/,
      /cloudinary:\/\/(.+)/
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(url)) {
        return url;
      }
    }
    
    // Si c'est une URL relative ou autre format
    if (url.startsWith('http')) {
      return url;
    }
    
    return null;
  }

  /**
   * Migre une vidéo vers Cloudflare Stream
   */
  async migrateVideo(videoUrl, productName) {
    try {
      console.log(`\n📹 Migration vidéo: ${productName}`);
      
      // Vérifier si déjà migré
      const existing = await this.db.isMediaMigrated(videoUrl, 'video');
      if (existing) {
        console.log(`⏭️  Vidéo déjà migrée: ${existing.cloudflareUrl}`);
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
      
      console.log(`⬆️  Upload vers Cloudflare Stream...`);
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
        
        console.log(`✅ Vidéo migrée: ${result.playbackUrl}`);
        this.stats.videos.migrated++;
        return result.playbackUrl;
      }
    } catch (error) {
      console.error(`❌ Erreur migration vidéo ${productName}:`, error.message);
      this.stats.videos.failed++;
      return null;
    }
  }

  /**
   * Migre une image vers Cloudflare Images
   */
  async migrateImage(imageUrl, productName) {
    try {
      console.log(`\n🖼️  Migration image: ${productName}`);
      
      // Vérifier si déjà migré
      const existing = await this.db.isMediaMigrated(imageUrl, 'image');
      if (existing) {
        console.log(`⏭️  Image déjà migrée: ${existing.cloudflareUrl}`);
        this.stats.images.skipped++;
        return existing.cloudflareUrl;
      }
      
      // Upload vers Cloudflare Images
      const metadata = {
        name: `${this.boutique}-${productName}`,
        boutique: this.boutique,
        folder: `${this.boutique}/images`,
        originalUrl: imageUrl,
        productName: productName,
        migratedAt: new Date().toISOString()
      };
      
      // Générer un ID unique pour l'image
      const imageId = `${this.boutique}-${productName}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      metadata.id = imageId;
      
      console.log(`⬆️  Upload vers Cloudflare Images...`);
      const result = await this.cloudflare.uploadImageFromUrl(imageUrl, metadata);
      
      if (result.success) {
        // Sauvegarder la migration
        await this.db.saveMigration({
          boutique: this.boutique,
          type: 'image',
          productName: productName,
          originalUrl: imageUrl,
          cloudflareUrl: result.publicUrl,
          cloudflareId: result.imageId,
          variants: result.variants,
          metadata: metadata
        });
        
        console.log(`✅ Image migrée: ${result.publicUrl}`);
        this.stats.images.migrated++;
        return result.publicUrl;
      }
    } catch (error) {
      console.error(`❌ Erreur migration image ${productName}:`, error.message);
      this.stats.images.failed++;
      return null;
    }
  }

  /**
   * Migre tous les produits de la boutique
   */
  async migrateProducts() {
    try {
      console.log(`\n🚀 Démarrage migration CALIGAZ vers Cloudflare`);
      console.log(`📁 Organisation: ${this.boutique}/videos et ${this.boutique}/images\n`);
      
      // Récupérer tous les produits
      const products = await this.db.getProducts();
      console.log(`📦 ${products.length} produits trouvés\n`);
      
      // Traiter chaque produit
      for (const product of products) {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`📦 Produit: ${product.name}`);
        console.log(`${'='.repeat(50)}`);
        
        let updated = false;
        const updates = {};
        
        // Migrer la vidéo si présente
        if (product.video) {
          const videoUrl = this.extractCloudinaryUrl(product.video);
          if (videoUrl) {
            this.stats.videos.total++;
            const newVideoUrl = await this.migrateVideo(videoUrl, product.name);
            if (newVideoUrl && newVideoUrl !== product.video) {
              updates.video = newVideoUrl;
              updated = true;
            }
          }
        }
        
        // Migrer l'image si présente
        if (product.image) {
          const imageUrl = this.extractCloudinaryUrl(product.image);
          if (imageUrl) {
            this.stats.images.total++;
            const newImageUrl = await this.migrateImage(imageUrl, product.name);
            if (newImageUrl && newImageUrl !== product.image) {
              updates.image = newImageUrl;
              updated = true;
            }
          }
        }
        
        // Mettre à jour le produit en base de données
        if (updated) {
          const success = await this.db.updateProduct(product._id, updates);
          if (success) {
            console.log(`✅ Produit mis à jour en base de données`);
          } else {
            console.log(`⚠️  Échec mise à jour du produit en base`);
          }
        }
        
        // Pause entre les produits pour éviter rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
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
   * Affiche le résumé de la migration
   */
  displaySummary() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 RÉSUMÉ DE LA MIGRATION - ${this.boutique}`);
    console.log(`${'='.repeat(60)}\n`);
    
    console.log(`📹 VIDÉOS:`);
    console.log(`   Total: ${this.stats.videos.total}`);
    console.log(`   ✅ Migrées: ${this.stats.videos.migrated}`);
    console.log(`   ⏭️  Déjà migrées: ${this.stats.videos.skipped}`);
    console.log(`   ❌ Échouées: ${this.stats.videos.failed}\n`);
    
    console.log(`🖼️  IMAGES:`);
    console.log(`   Total: ${this.stats.images.total}`);
    console.log(`   ✅ Migrées: ${this.stats.images.migrated}`);
    console.log(`   ⏭️  Déjà migrées: ${this.stats.images.skipped}`);
    console.log(`   ❌ Échouées: ${this.stats.images.failed}\n`);
    
    console.log(`💰 ÉCONOMIES ESTIMÉES:`);
    const totalMedia = this.stats.videos.migrated + this.stats.images.migrated;
    const savingsPercent = 70; // Cloudflare est ~70% moins cher
    console.log(`   Réduction des coûts: ~${savingsPercent}%`);
    console.log(`   Médias optimisés: ${totalMedia}`);
    
    console.log(`\n🎯 Migration ${this.boutique} terminée !`);
    console.log(`${'='.repeat(60)}\n`);
  }

  /**
   * Vérifie la migration
   */
  async verifyMigration() {
    try {
      console.log(`\n🔍 Vérification de la migration ${this.boutique}...`);
      
      // Lister les vidéos sur Cloudflare
      const videos = await this.cloudflare.listVideos(this.boutique);
      console.log(`📹 ${videos.length} vidéos trouvées sur Cloudflare`);
      
      // Lister les images sur Cloudflare
      const images = await this.cloudflare.listImages();
      const caligazImages = images.filter(img => 
        img.meta?.boutique === this.boutique || 
        img.filename?.includes(this.boutique)
      );
      console.log(`🖼️  ${caligazImages.length} images trouvées sur Cloudflare`);
      
      // Vérifier l'historique des migrations
      const history = await this.db.getMigrationHistory(this.boutique);
      console.log(`📝 ${history.length} migrations enregistrées`);
      
      return {
        videos: videos.length,
        images: caligazImages.length,
        migrations: history.length
      };
    } catch (error) {
      console.error('❌ Erreur vérification:', error);
      throw error;
    }
  }
}

// Exécution du script
async function main() {
  const migration = new CaligazMigration();
  
  try {
    // Lancer la migration
    await migration.migrateProducts();
    
    // Vérifier la migration
    await migration.verifyMigration();
    
    console.log('\n✨ Migration CALIGAZ complétée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Lancer si exécuté directement
if (require.main === module) {
  main();
}

module.exports = CaligazMigration;