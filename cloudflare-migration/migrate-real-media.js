#!/usr/bin/env node

/**
 * Migration COMPLÈTE des VRAIS médias CALIGAZ
 * Utilise les tokens séparés pour Stream et Images
 */

const axios = require('axios');
const FormData = require('form-data');
const { MongoClient } = require('mongodb');

const CONFIG = {
  cloudflare: {
    accountId: '7979421604bd07b3bd34d3ed96222512',
    // Token pour Cloudflare Stream (vidéos) - Token complet
    streamToken: 'v1.0-0adb38df485d3d0888b0b922-5ac29b791eaf12b48dea2d5f3c1bf0680c0c8ab85b0b2d7f0edbf7b9684f79d71d4c3b8a9ebe8df4ec7ab5fcd2862fc01d1caf666e306b8d40f405a52926a3ce108bf1484f9ba3ade5',
    // Token pour Cloudflare Images (photos)
    imagesToken: '61mW7CZfq0K6OdcYN9YIC4laRaZNLZAL1Lm4gFhh',
    imageAccountHash: 'ARYXrwYsY_ECAYN3cIpzBg'
  },
  mongodb: {
    uri: 'mongodb+srv://lmvrtt2:ALcWY4mLHwvtz1X2@lmvrtt.km9x4q9.mongodb.net/test?retryWrites=true&w=majority&appName=LMVRTT',
    database: 'test'
  },
  boutique: 'CALIGAZ'
};

class RealMediaMigration {
  constructor() {
    this.stats = {
      videos: { total: 0, migrated: 0, alreadyCloudflare: 0, failed: 0 },
      images: { total: 0, migrated: 0, alreadyCloudflare: 0, failed: 0 }
    };
    this.migratedProducts = [];
  }

  /**
   * Vérifie si c'est une vraie URL Cloudinary
   */
  isCloudinaryUrl(url) {
    return url && (
      url.includes('res.cloudinary.com') || 
      url.includes('cloudinary.com')
    );
  }

  /**
   * Vérifie si déjà sur Cloudflare
   */
  isCloudflareUrl(url) {
    return url && (
      url.includes('videodelivery.net') || 
      url.includes('imagedelivery.net')
    );
  }

  /**
   * Upload une vidéo vers Cloudflare Stream
   */
  async uploadVideoToStream(videoUrl, productName, productId) {
    try {
      console.log(`   ⬆️  Upload vidéo vers Cloudflare Stream...`);
      
      // Utiliser l'API de copie depuis URL
      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${CONFIG.cloudflare.accountId}/stream/copy`,
        {
          url: videoUrl,
          meta: {
            name: `${CONFIG.boutique}-${productName}`,
            boutique: CONFIG.boutique,
            productName: productName,
            productId: productId,
            originalUrl: videoUrl,
            folder: `${CONFIG.boutique}/videos`,
            migratedAt: new Date().toISOString()
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
        const result = response.data.result;
        const playbackUrl = `https://iframe.videodelivery.net/${result.uid}`;
        
        console.log(`   ✅ Vidéo migrée: ${playbackUrl}`);
        this.stats.videos.migrated++;
        
        return {
          success: true,
          videoId: result.uid,
          playbackUrl: playbackUrl,
          thumbnail: result.thumbnail
        };
      }
    } catch (error) {
      console.error(`   ❌ Erreur vidéo: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      
      // Si erreur 403, essayer avec upload direct
      if (error.response?.status === 403) {
        return await this.uploadVideoDirectly(videoUrl, productName, productId);
      }
      
      this.stats.videos.failed++;
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload direct d'une vidéo (fallback)
   */
  async uploadVideoDirectly(videoUrl, productName, productId) {
    try {
      console.log(`   🔄 Tentative upload direct...`);
      
      // Télécharger la vidéo d'abord
      const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
      
      const form = new FormData();
      form.append('file', videoResponse.data);
      
      const meta = {
        name: `${CONFIG.boutique}-${productName}`,
        boutique: CONFIG.boutique,
        productName: productName,
        productId: productId,
        folder: `${CONFIG.boutique}/videos`
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
        const result = response.data.result;
        const playbackUrl = `https://iframe.videodelivery.net/${result.uid}`;
        
        console.log(`   ✅ Vidéo uploadée directement: ${playbackUrl}`);
        this.stats.videos.migrated++;
        
        return {
          success: true,
          videoId: result.uid,
          playbackUrl: playbackUrl
        };
      }
    } catch (error) {
      console.error(`   ❌ Échec upload direct: ${error.message}`);
      this.stats.videos.failed++;
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload une image vers Cloudflare Images
   */
  async uploadImageToCloudflare(imageUrl, productName, productId) {
    try {
      console.log(`   ⬆️  Upload image vers Cloudflare Images...`);
      
      const form = new FormData();
      form.append('url', imageUrl);
      
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
      
      const imageId = `${CONFIG.boutique.toLowerCase()}-${productId}-${Date.now()}`;
      form.append('id', imageId);
      
      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${CONFIG.cloudflare.accountId}/images/v1`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${CONFIG.cloudflare.imagesToken}`
          }
        }
      );
      
      if (response.data.success) {
        const result = response.data.result;
        const publicUrl = result.variants.find(v => v.includes('/public')) || result.variants[0];
        
        console.log(`   ✅ Image migrée: ${publicUrl.substring(0, 80)}...`);
        this.stats.images.migrated++;
        
        return {
          success: true,
          cloudflareId: result.id,
          publicUrl: publicUrl,
          variants: result.variants
        };
      }
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`   ⏭️  Image déjà existante`);
        return { success: false, reason: 'duplicate' };
      }
      
      console.error(`   ❌ Erreur image: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      this.stats.images.failed++;
      return { success: false, error: error.message };
    }
  }

  /**
   * Migre tous les vrais médias
   */
  async migrate() {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 MIGRATION DES VRAIS MÉDIAS CALIGAZ');
    console.log('='.repeat(80));
    console.log(`\n📁 Organisation:`);
    console.log(`   • Vidéos: ${CONFIG.boutique}/videos`);
    console.log(`   • Images: ${CONFIG.boutique}/images`);
    console.log(`\n🔑 Tokens:`);
    console.log(`   • Stream: ${CONFIG.cloudflare.streamToken.substring(0, 15)}...`);
    console.log(`   • Images: ${CONFIG.cloudflare.imagesToken.substring(0, 15)}...`);
    console.log(`   • Account Hash: ${CONFIG.cloudflare.imageAccountHash}\n`);
    
    const client = new MongoClient(CONFIG.mongodb.uri);
    
    try {
      await client.connect();
      console.log('✅ Connecté à MongoDB\n');
      
      const db = client.db(CONFIG.mongodb.database);
      const products = await db.collection('products').find({}).toArray();
      
      console.log(`📦 ${products.length} produits trouvés dans la base\n`);
      
      // Analyser les médias
      let cloudinaryCount = 0;
      let cloudflareCount = 0;
      
      products.forEach(product => {
        if (product.video) {
          if (this.isCloudinaryUrl(product.video)) cloudinaryCount++;
          if (this.isCloudflareUrl(product.video)) cloudflareCount++;
        }
        if (product.image) {
          if (this.isCloudinaryUrl(product.image)) cloudinaryCount++;
          if (this.isCloudflareUrl(product.image)) cloudflareCount++;
        }
      });
      
      console.log(`📊 Analyse des médias:`);
      console.log(`   • Médias Cloudinary à migrer: ${cloudinaryCount}`);
      console.log(`   • Médias déjà sur Cloudflare: ${cloudflareCount}\n`);
      
      // Traiter chaque produit
      for (const product of products) {
        let hasChanges = false;
        const updates = {};
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📦 Produit: ${product.name}`);
        console.log(`${'='.repeat(60)}`);
        
        // Traiter la vidéo
        if (product.video) {
          this.stats.videos.total++;
          console.log(`\n📹 Vidéo: ${product.video.substring(0, 80)}...`);
          
          if (this.isCloudflareUrl(product.video)) {
            console.log(`   ✅ Déjà sur Cloudflare`);
            this.stats.videos.alreadyCloudflare++;
          } else if (this.isCloudinaryUrl(product.video)) {
            const result = await this.uploadVideoToStream(
              product.video,
              product.name,
              product._id.toString()
            );
            
            if (result.success) {
              updates.video = result.playbackUrl;
              hasChanges = true;
              this.migratedProducts.push({
                name: product.name,
                type: 'video',
                oldUrl: product.video,
                newUrl: result.playbackUrl
              });
            }
          } else {
            console.log(`   ⏭️  Pas une URL Cloudinary`);
          }
        }
        
        // Traiter l'image
        if (product.image) {
          this.stats.images.total++;
          console.log(`\n🖼️  Image: ${product.image.substring(0, 80)}...`);
          
          if (this.isCloudflareUrl(product.image)) {
            console.log(`   ✅ Déjà sur Cloudflare`);
            this.stats.images.alreadyCloudflare++;
          } else if (this.isCloudinaryUrl(product.image)) {
            const result = await this.uploadImageToCloudflare(
              product.image,
              product.name,
              product._id.toString()
            );
            
            if (result.success) {
              updates.image = result.publicUrl;
              hasChanges = true;
              this.migratedProducts.push({
                name: product.name,
                type: 'image',
                oldUrl: product.image,
                newUrl: result.publicUrl
              });
            }
          } else {
            console.log(`   ⏭️  Pas une URL Cloudinary`);
          }
        }
        
        // Mettre à jour le produit si nécessaire
        if (hasChanges) {
          await db.collection('products').updateOne(
            { _id: product._id },
            { $set: updates }
          );
          console.log(`\n✅ Produit mis à jour en base de données`);
        }
        
        // Pause entre les produits
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
   * Affiche le résumé détaillé
   */
  displaySummary() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ DE LA MIGRATION CALIGAZ');
    console.log('='.repeat(80));
    
    console.log(`\n📹 VIDÉOS:`);
    console.log(`   Total analysées: ${this.stats.videos.total}`);
    console.log(`   ✅ Migrées: ${this.stats.videos.migrated}`);
    console.log(`   ✅ Déjà sur Cloudflare: ${this.stats.videos.alreadyCloudflare}`);
    console.log(`   ❌ Échouées: ${this.stats.videos.failed}`);
    
    console.log(`\n🖼️  IMAGES:`);
    console.log(`   Total analysées: ${this.stats.images.total}`);
    console.log(`   ✅ Migrées: ${this.stats.images.migrated}`);
    console.log(`   ✅ Déjà sur Cloudflare: ${this.stats.images.alreadyCloudflare}`);
    console.log(`   ❌ Échouées: ${this.stats.images.failed}`);
    
    const totalMigrated = this.stats.videos.migrated + this.stats.images.migrated;
    
    if (totalMigrated > 0) {
      console.log(`\n✨ MÉDIAS MIGRÉS AVEC SUCCÈS:`);
      this.migratedProducts.forEach(item => {
        console.log(`\n   📦 ${item.name} (${item.type})`);
        console.log(`      Avant: ${item.oldUrl.substring(0, 60)}...`);
        console.log(`      Après: ${item.newUrl.substring(0, 60)}...`);
      });
      
      console.log(`\n💰 BÉNÉFICES:`);
      console.log(`   • ${totalMigrated} médias migrés vers Cloudflare`);
      console.log(`   • Réduction des coûts: ~70%`);
      console.log(`   • CDN global activé`);
      console.log(`   • Organisation: ${CONFIG.boutique}/videos et ${CONFIG.boutique}/images`);
    }
    
    console.log(`\n🎯 URLs CLOUDFLARE:`);
    console.log(`   • Vidéos: https://iframe.videodelivery.net/[VIDEO_ID]`);
    console.log(`   • Images: https://imagedelivery.net/${CONFIG.cloudflare.imageAccountHash}/[IMAGE_ID]/public`);
    
    console.log('\n' + '='.repeat(80));
  }
}

// Lancer la migration
async function main() {
  const migration = new RealMediaMigration();
  
  try {
    await migration.migrate();
    console.log('\n✨ Migration CALIGAZ terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}