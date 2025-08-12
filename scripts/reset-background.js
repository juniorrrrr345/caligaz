const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function resetBackground() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connecté à MongoDB');

    const db = client.db('caligaz');
    const settingsCollection = db.collection('settings');

    // Enlever l'image de fond
    const result = await settingsCollection.updateOne(
      {},
      {
        $set: {
          backgroundImage: '',
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Image de fond retirée');
    } else {
      console.log('⚠️  Aucune modification');
    }

    // Vérifier les settings
    const settings = await settingsCollection.findOne({});
    console.log('\n📋 Settings actuels:');
    console.log('- Shop Name:', settings.shopName);
    console.log('- Background Image:', settings.backgroundImage || '(aucune)');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
    console.log('\n✨ Terminé!');
  }
}

resetBackground();