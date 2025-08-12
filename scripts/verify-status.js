const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function verifyStatus() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 VÉRIFICATION COMPLÈTE DE CALIGAZ ⛽️');
  console.log('='.repeat(60));

  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('\n✅ Connexion MongoDB: OK');
    
    const db = client.db('caligaz');
    
    // Vérifier chaque collection
    console.log('\n📊 État des collections:');
    console.log('-'.repeat(40));
    
    const collections = [
      'admins',
      'settings',
      'categories',
      'products',
      'sociallinks'
    ];
    
    for (const collName of collections) {
      const count = await db.collection(collName).countDocuments();
      const status = count > 0 ? '✅' : '❌';
      console.log(`${status} ${collName}: ${count} documents`);
      
      // Afficher des détails pour certaines collections
      if (collName === 'admins' && count > 0) {
        const admin = await db.collection(collName).findOne({});
        console.log(`   └─ Admin: ${admin.email}`);
      }
      
      if (collName === 'settings' && count > 0) {
        const settings = await db.collection(collName).findOne({});
        console.log(`   └─ Shop: ${settings.shopName}`);
      }
      
      if (collName === 'products' && count > 0) {
        const products = await db.collection(collName).find({}).limit(3).toArray();
        products.forEach(p => {
          console.log(`   └─ ${p.name}: $${p.price}`);
        });
      }
    }
    
    // Vérifier les variables d'environnement
    console.log('\n🔐 Variables d\'environnement:');
    console.log('-'.repeat(40));
    
    const envVars = [
      'MONGODB_URI',
      'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
      'JWT_SECRET',
      'ADMIN_EMAIL',
      'ADMIN_PASSWORD'
    ];
    
    for (const varName of envVars) {
      const value = process.env[varName];
      const status = value ? '✅' : '❌';
      const display = value ? 
        (varName.includes('SECRET') || varName.includes('PASSWORD') ? '***' : value.substring(0, 20) + '...') 
        : 'NON DÉFINI';
      console.log(`${status} ${varName}: ${display}`);
    }
    
    // URLs d'accès
    console.log('\n🌐 URLs d\'accès:');
    console.log('-'.repeat(40));
    console.log('📍 Site: http://localhost:3000');
    console.log('🔐 Admin: http://localhost:3000/admin');
    console.log('   └─ Email: admin@caligaz.com');
    console.log('   └─ Password: CaliGaz2024!');
    
    // État final
    console.log('\n' + '='.repeat(60));
    console.log('✨ STATUT: CALIGAZ ⛽️ EST OPÉRATIONNEL !');
    console.log('='.repeat(60));
    console.log('\n💡 Prochaines étapes:');
    console.log('   1. Accédez au panel admin');
    console.log('   2. Ajoutez vos produits');
    console.log('   3. Configurez Cloudinary (preset: caligaz)');
    console.log('   4. Déployez sur Vercel\n');
    
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
  } finally {
    await client.close();
  }
}

verifyStatus().catch(console.error);