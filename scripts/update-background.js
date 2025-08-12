const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function updateBackground() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connecté à MongoDB');

    const db = client.db('caligaz');
    const settingsCollection = db.collection('settings');

    // Mettre à jour l'image de fond et s'assurer que shopName existe
    const result = await settingsCollection.updateOne(
      {},
      {
        $set: {
          shopName: 'CaliGaz ⛽️',
          shopDescription: 'Station-service de qualité - Carburants et services',
          backgroundImage: 'https://i.imgur.com/dRCR7PM.png',
          backgroundOpacity: 30, // Opacité de l'overlay (0-100)
          backgroundBlur: 3, // Blur de l'overlay (0-20)
          updatedAt: new Date()
        }
      },
      { upsert: true } // Créer le document s'il n'existe pas
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Image de fond mise à jour : https://i.imgur.com/dRCR7PM.png');
    } else {
      console.log('⚠️  Aucune modification (peut-être déjà à jour)');
    }

    // Vérifier les settings
    const settings = await settingsCollection.findOne({});
    console.log('\n📋 Settings actuels:');
    console.log('- Shop Name:', settings.shopName);
    console.log('- Background Image:', settings.backgroundImage);
    console.log('- Background Opacity:', settings.backgroundOpacity);
    console.log('- Background Blur:', settings.backgroundBlur);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
    console.log('\n✨ Mise à jour terminée!');
  }
}

updateBackground();