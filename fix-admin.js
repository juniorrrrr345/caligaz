const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function fixAdmin() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connecté à MongoDB');

    const db = client.db('caligaz');
    
    // 1. Initialiser les Settings
    console.log('\n📋 Vérification des Settings...');
    const settingsCollection = db.collection('settings');
    const settings = await settingsCollection.findOne({});
    
    if (!settings) {
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
      console.log('✅ Settings créés');
    } else {
      console.log('✅ Settings existants trouvés');
    }

    // 2. Initialiser les Categories
    console.log('\n📦 Vérification des Catégories...');
    const categoriesCollection = db.collection('categories');
    const categoriesCount = await categoriesCollection.countDocuments();
    
    if (categoriesCount === 0) {
      const defaultCategories = [
        { name: 'Carburants', slug: 'carburants', description: 'Essence, Diesel, GPL', createdAt: new Date() },
        { name: 'Lubrifiants', slug: 'lubrifiants', description: 'Huiles et lubrifiants', createdAt: new Date() },
        { name: 'Accessoires', slug: 'accessoires', description: 'Accessoires auto', createdAt: new Date() },
        { name: 'Services', slug: 'services', description: 'Services station', createdAt: new Date() }
      ];
      
      await categoriesCollection.insertMany(defaultCategories);
      console.log('✅ Catégories créées');
    } else {
      console.log(`✅ ${categoriesCount} catégories existantes`);
    }

    // 3. Initialiser les Social Links
    console.log('\n🔗 Vérification des Social Links...');
    const socialLinksCollection = db.collection('sociallinks');
    const socialLinksCount = await socialLinksCollection.countDocuments();
    
    if (socialLinksCount === 0) {
      const defaultSocialLinks = [
        { platform: 'telegram', url: 'https://t.me/caligaz_shop', icon: 'telegram', order: 1, isActive: true },
        { platform: 'whatsapp', url: 'https://wa.me/1234567890', icon: 'whatsapp', order: 2, isActive: true },
        { platform: 'instagram', url: '', icon: 'instagram', order: 3, isActive: false },
        { platform: 'facebook', url: '', icon: 'facebook', order: 4, isActive: false }
      ];
      
      await socialLinksCollection.insertMany(defaultSocialLinks);
      console.log('✅ Social Links créés');
    } else {
      console.log(`✅ ${socialLinksCount} social links existants`);
    }

    // 4. Créer quelques produits de test
    console.log('\n🛍️ Vérification des Produits...');
    const productsCollection = db.collection('products');
    const productsCount = await productsCollection.countDocuments();
    
    if (productsCount === 0) {
      const sampleProducts = [
        {
          name: 'Essence Sans Plomb 95',
          description: 'Carburant de qualité supérieure',
          price: 1.85,
          category: 'Carburants',
          image: 'https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=500',
          inStock: true,
          featured: true,
          createdAt: new Date()
        },
        {
          name: 'Diesel Premium',
          description: 'Diesel haute performance',
          price: 1.75,
          category: 'Carburants',
          image: 'https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=500',
          inStock: true,
          featured: true,
          createdAt: new Date()
        },
        {
          name: 'Huile Moteur 5W30',
          description: 'Huile synthétique haute qualité',
          price: 45.99,
          category: 'Lubrifiants',
          image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=500',
          inStock: true,
          featured: false,
          createdAt: new Date()
        }
      ];
      
      await productsCollection.insertMany(sampleProducts);
      console.log('✅ Produits de test créés');
    } else {
      console.log(`✅ ${productsCount} produits existants`);
    }

    // 5. Afficher le résumé
    console.log('\n' + '='.repeat(50));
    console.log('📊 RÉSUMÉ DE LA BASE DE DONNÉES CALIGAZ');
    console.log('='.repeat(50));
    
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`📁 ${col.name}: ${count} documents`);
    }
    
    console.log('\n✅ Configuration Admin:');
    console.log('- Email:', process.env.ADMIN_EMAIL || 'admin@caligaz.com');
    console.log('- Password:', process.env.ADMIN_PASSWORD || 'CaliGaz2024!');
    console.log('- URL: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
    console.log('\n✨ Vérification terminée!');
    console.log('🚀 Vous pouvez maintenant accéder à l\'admin sur http://localhost:3000/admin');
  }
}

fixAdmin();