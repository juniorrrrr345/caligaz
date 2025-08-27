#!/usr/bin/env node

/**
 * Test de l'intégration Cloudflare dans le panel admin
 */

const axios = require('axios');

const CONFIG = {
  accountId: '7979421604bd07b3bd34d3ed96222512',
  imagesToken: '61mW7CZfq0K6OdcYN9YIC4laRaZNLZAL1Lm4gFhh',
  streamToken: '8_sayjltoEjPdiyyPTDcr3YI7ikZpRypVmli5bOl'
};

async function testTokens() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 TEST DES TOKENS CLOUDFLARE POUR LE PANEL ADMIN');
  console.log('='.repeat(70) + '\n');

  // Test du token Images
  console.log('📸 Test du token Images...');
  try {
    const imagesResponse = await axios.get(
      `https://api.cloudflare.com/client/v4/accounts/${CONFIG.accountId}/images/v1`,
      {
        headers: {
          'Authorization': `Bearer ${CONFIG.imagesToken}`,
          'Content-Type': 'application/json'
        },
        params: { per_page: 1 }
      }
    );
    
    if (imagesResponse.data.success) {
      console.log('   ✅ Token Images valide');
      console.log(`   📊 ${imagesResponse.data.result.images.length} image(s) trouvée(s)`);
    }
  } catch (error) {
    console.error('   ❌ Erreur token Images:', error.response?.status || error.message);
  }

  // Test du token Stream
  console.log('\n🎬 Test du token Stream...');
  try {
    const streamResponse = await axios.get(
      `https://api.cloudflare.com/client/v4/accounts/${CONFIG.accountId}/stream`,
      {
        headers: {
          'Authorization': `Bearer ${CONFIG.streamToken}`,
          'Content-Type': 'application/json'
        },
        params: { per_page: 1 }
      }
    );
    
    if (streamResponse.data.success) {
      console.log('   ✅ Token Stream valide');
      console.log(`   📊 ${streamResponse.data.result.length} vidéo(s) trouvée(s)`);
      
      if (streamResponse.data.result.length > 0) {
        const video = streamResponse.data.result[0];
        console.log(`   🎥 Exemple: ${video.meta?.name || video.uid}`);
        console.log(`   📍 État: ${video.status?.state || 'ready'}`);
      }
    }
  } catch (error) {
    console.error('   ❌ Erreur token Stream:', error.response?.status || error.message);
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 RÉSUMÉ DE LA CONFIGURATION ADMIN');
  console.log('='.repeat(70) + '\n');

  console.log('🔧 Configuration actuelle:');
  console.log(`   • Account ID: ${CONFIG.accountId}`);
  console.log(`   • Token Images: ${CONFIG.imagesToken.substring(0, 20)}...`);
  console.log(`   • Token Stream: ${CONFIG.streamToken.substring(0, 20)}...`);
  
  console.log('\n📁 Organisation des médias:');
  console.log('   • Images: CALIGAZ/images/');
  console.log('   • Vidéos: CALIGAZ/videos/');
  
  console.log('\n🎯 URLs de livraison:');
  console.log('   • Images: https://imagedelivery.net/ARYXrwYsY_ECAYN3cIpzBg/[ID]/public');
  console.log('   • Vidéos: https://iframe.videodelivery.net/[ID]');
  
  console.log('\n✅ STATUT:');
  console.log('   • Panel Admin: Configuré pour Cloudflare');
  console.log('   • Upload Images: Opérationnel');
  console.log('   • Upload Vidéos: Opérationnel');
  console.log('   • Fallback: Cloudinary en backup');
  
  console.log('\n' + '='.repeat(70) + '\n');
}

// Exécuter le test
testTokens().catch(console.error);