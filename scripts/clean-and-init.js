const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function cleanAndInit() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI non trouvé dans .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connecté à MongoDB');

    const db = client.db('caligaz');
    
    // 1. NETTOYER TOUTES LES COLLECTIONS
    console.log('\n🧹 NETTOYAGE COMPLET DE LA BASE DE DONNÉES...');
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({});
      console.log(`   ✓ Collection ${collection.name} vidée`);
    }

    console.log('\n📦 CRÉATION DES DONNÉES FRAÎCHES...\n');

    // 2. CRÉER L'ADMIN
    console.log('👤 Création de l\'administrateur...');
    const adminsCollection = db.collection('admins');
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('CaliGaz2024!', salt);
    
    const admin = {
      username: 'admin',
      email: 'admin@caligaz.com',
      password: hashedPassword,
      role: 'superadmin',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await adminsCollection.insertOne(admin);
    console.log('   ✓ Admin créé: admin@caligaz.com / CaliGaz2024!');

    // 3. CRÉER LES SETTINGS
    console.log('\n⚙️ Création des paramètres...');
    const settingsCollection = db.collection('settings');
    
    const settings = {
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
    
    await settingsCollection.insertOne(settings);
    console.log('   ✓ Settings créés');

    // 4. CRÉER LES CATÉGORIES
    console.log('\n📂 Création des catégories...');
    const categoriesCollection = db.collection('categories');
    
    const categories = [
      { name: 'Carburants', slug: 'carburants', description: 'Essence, Diesel, GPL', order: 1 },
      { name: 'Lubrifiants', slug: 'lubrifiants', description: 'Huiles moteur et additifs', order: 2 },
      { name: 'Accessoires', slug: 'accessoires', description: 'Accessoires auto', order: 3 },
      { name: 'Services', slug: 'services', description: 'Services station', order: 4 }
    ];
    
    for (const cat of categories) {
      await categoriesCollection.insertOne({
        ...cat,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log(`   ✓ ${categories.length} catégories créées`);

    // 5. CRÉER QUELQUES PRODUITS DE DÉMONSTRATION
    console.log('\n🛍️ Création de produits de démonstration...');
    const productsCollection = db.collection('products');
    
    const products = [
      {
        name: 'Essence Sans Plomb 95',
        description: 'Carburant de qualité supérieure',
        price: 1.85,
        category: 'carburants',
        images: [],
        stock: 1000,
        isActive: true,
        featured: true
      },
      {
        name: 'Diesel Premium',
        description: 'Diesel haute performance',
        price: 1.75,
        category: 'carburants',
        images: [],
        stock: 1000,
        isActive: true,
        featured: true
      },
      {
        name: 'Huile Moteur 5W30',
        description: 'Huile synthétique haute qualité',
        price: 45.99,
        category: 'lubrifiants',
        images: [],
        stock: 50,
        isActive: true,
        featured: false
      }
    ];
    
    for (const product of products) {
      await productsCollection.insertOne({
        ...product,
        views: 0,
        sales: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log(`   ✓ ${products.length} produits créés`);

    // 6. CRÉER LES SOCIAL LINKS
    console.log('\n🔗 Création des liens sociaux...');
    const socialLinksCollection = db.collection('sociallinks');
    
    const socialLink = {
      platform: 'telegram',
      url: 'https://t.me/caligaz_shop',
      username: '@caligaz_shop',
      isActive: true,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await socialLinksCollection.insertOne(socialLink);
    console.log('   ✓ Liens sociaux créés');

    // VÉRIFICATION FINALE
    console.log('\n' + '='.repeat(60));
    console.log('✅ BASE DE DONNÉES CALIGAZ INITIALISÉE AVEC SUCCÈS !');
    console.log('='.repeat(60));
    
    console.log('\n📊 Résumé:');
    const adminCount = await adminsCollection.countDocuments();
    const settingsCount = await settingsCollection.countDocuments();
    const categoriesCount = await categoriesCollection.countDocuments();
    const productsCount = await productsCollection.countDocuments();
    const socialLinksCount = await socialLinksCollection.countDocuments();
    
    console.log(`   • Admins: ${adminCount}`);
    console.log(`   • Settings: ${settingsCount}`);
    console.log(`   • Catégories: ${categoriesCount}`);
    console.log(`   • Produits: ${productsCount}`);
    console.log(`   • Liens sociaux: ${socialLinksCount}`);
    
    console.log('\n🔐 CONNEXION ADMIN:');
    console.log('   URL: http://localhost:3000/admin');
    console.log('   Email: admin@caligaz.com');
    console.log('   Mot de passe: CaliGaz2024!');
    
    console.log('\n✨ Tout est prêt ! Lancez "npm run dev" pour démarrer.\n');

  } catch (error) {
    console.error('❌ ERREUR:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Exécuter le script
cleanAndInit().catch(console.error);