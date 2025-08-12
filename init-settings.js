const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function initSettings() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connecté à MongoDB');

    const db = client.db('caligaz');
    const settingsCollection = db.collection('settings');

    // Vérifier si les settings existent déjà
    const existingSettings = await settingsCollection.findOne({});
    
    if (existingSettings) {
      console.log('⚠️  Les settings existent déjà');
      
      // Mettre à jour avec les bonnes valeurs pour CaliGaz
      await settingsCollection.updateOne(
        {},
        {
          $set: {
            shopName: 'CaliGaz ⛽️',
            shopDescription: 'Station-service de qualité - Carburants et services',
            currency: 'USD',
            currencySymbol: '$',
            contactEmail: 'contact@caligaz.com',
            contactPhone: '+1234567890',
            whatsappNumber: '+1234567890',
            telegramUsername: '@caligaz_shop',
            socialLinks: {
              facebook: '',
              instagram: '',
              twitter: '',
              telegram: '@caligaz_shop'
            },
            enableReviews: true,
            enableWishlist: true,
            maintenanceMode: false,
            updatedAt: new Date()
          }
        }
      );
      console.log('✅ Settings mis à jour pour CaliGaz ⛽️');
    } else {
      // Créer les settings initiaux
      const defaultSettings = {
        shopName: 'CaliGaz ⛽️',
        shopDescription: 'Station-service de qualité - Carburants et services',
        currency: 'USD',
        currencySymbol: '$',
        contactEmail: 'contact@caligaz.com',
        contactPhone: '+1234567890',
        whatsappNumber: '+1234567890',
        telegramUsername: '@caligaz_shop',
        socialLinks: {
          facebook: '',
          instagram: '',
          twitter: '',
          telegram: '@caligaz_shop'
        },
        enableReviews: true,
        enableWishlist: true,
        maintenanceMode: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await settingsCollection.insertOne(defaultSettings);
      console.log('✅ Settings créés pour CaliGaz ⛽️');
    }

    // Afficher les settings actuels
    const finalSettings = await settingsCollection.findOne({});
    console.log('\n📋 Settings actuels:');
    console.log('- Shop Name:', finalSettings.shopName);
    console.log('- Email:', finalSettings.contactEmail);
    console.log('- Currency:', finalSettings.currency);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
    console.log('\n✨ Configuration terminée!');
  }
}

initSettings();