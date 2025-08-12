const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function testAdmin() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST COMPLET DU PANEL ADMIN CALIGAZ ⛽️');
  console.log('='.repeat(60));

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('caligaz');

    // Test 1: Vérifier l'admin
    console.log('\n1️⃣ Test Admin:');
    const admin = await db.collection('admins').findOne({ email: 'admin@caligaz.com' });
    if (admin) {
      console.log('   ✅ Admin trouvé: ' + admin.email);
    } else {
      console.log('   ❌ Admin non trouvé!');
    }

    // Test 2: Vérifier les settings
    console.log('\n2️⃣ Test Settings:');
    const settings = await db.collection('settings').findOne({});
    if (settings && settings.shopName) {
      console.log('   ✅ Settings OK: ' + settings.shopName);
    } else {
      console.log('   ❌ Settings manquants!');
    }

    // Test 3: Vérifier les produits avec prices
    console.log('\n3️⃣ Test Produits:');
    const products = await db.collection('products').find({}).toArray();
    let allHavePrices = true;
    
    for (const product of products) {
      if (!product.prices || Object.keys(product.prices).length === 0) {
        console.log(`   ❌ ${product.name} - pas de prices!`);
        allHavePrices = false;
      } else {
        console.log(`   ✅ ${product.name} - ${Object.keys(product.prices).length} prix`);
      }
    }

    // Test 4: Vérifier les catégories
    console.log('\n4️⃣ Test Catégories:');
    const categories = await db.collection('categories').countDocuments();
    if (categories > 0) {
      console.log(`   ✅ ${categories} catégories trouvées`);
    } else {
      console.log('   ❌ Aucune catégorie!');
    }

    // Test 5: Vérifier les social links
    console.log('\n5️⃣ Test Social Links:');
    const socialLinks = await db.collection('sociallinks').countDocuments();
    if (socialLinks > 0) {
      console.log(`   ✅ ${socialLinks} liens sociaux trouvés`);
    } else {
      console.log('   ❌ Aucun lien social!');
    }

    // Résultat final
    console.log('\n' + '='.repeat(60));
    
    if (admin && settings && allHavePrices && categories > 0) {
      console.log('✅ TOUS LES TESTS PASSENT !');
      console.log('='.repeat(60));
      console.log('\n🎉 Le panel admin devrait fonctionner sans erreur !');
      console.log('\n📌 Accès:');
      console.log('   URL: http://localhost:3000/admin');
      console.log('   Email: admin@caligaz.com');
      console.log('   Password: CaliGaz2024!');
    } else {
      console.log('⚠️  CERTAINS TESTS ÉCHOUENT');
      console.log('='.repeat(60));
      console.log('\n💡 Relancez: node scripts/clean-and-init.js');
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  } finally {
    await client.close();
    console.log('\n');
  }
}

testAdmin().catch(console.error);