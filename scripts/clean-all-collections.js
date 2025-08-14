const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://lmvrtt2:ALcWY4mLHwvtz1X2@lmvrtt.km9x4q9.mongodb.net/lmvrtt_shop?retryWrites=true&w=majority&appName=LMVRTT';

async function cleanAllCollections() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    const db = mongoose.connection.db;
    
    // 1. Supprimer TOUTES les catégories
    console.log('\n🏷️ Suppression de TOUTES les catégories...');
    const categoriesResult = await db.collection('categories').deleteMany({});
    console.log(`✅ ${categoriesResult.deletedCount} catégorie(s) supprimée(s)`);
    
    // 2. Supprimer TOUTES les farms
    console.log('\n🏭 Suppression de TOUTES les farms...');
    const farmsResult = await db.collection('farms').deleteMany({});
    console.log(`✅ ${farmsResult.deletedCount} farm(s) supprimée(s)`);
    
    // 3. Supprimer tous les menus SAUF CaliGaz (le menu principal)
    console.log('\n📋 Suppression des menus (sauf CaliGaz)...');
    const menusResult = await db.collection('menus').deleteMany({ 
      slug: { $ne: 'caligaz' } 
    });
    console.log(`✅ ${menusResult.deletedCount} menu(s) supprimé(s)`);
    
    // 4. Optionnel : Supprimer aussi tous les produits qui ne sont pas du menu caligaz
    console.log('\n📦 Suppression des produits des autres menus...');
    const productsResult = await db.collection('products').deleteMany({ 
      menu: { $ne: 'caligaz' } 
    });
    console.log(`✅ ${productsResult.deletedCount} produit(s) supprimé(s)`);
    
    // 5. Vérifier ce qui reste
    console.log('\n📊 Vérification des données restantes...');
    
    const remainingMenus = await db.collection('menus').find({}).toArray();
    console.log(`\n✅ Menus restants: ${remainingMenus.map(m => m.name || m.slug).join(', ') || 'Aucun'}`);
    
    const remainingCategories = await db.collection('categories').countDocuments();
    console.log(`✅ Catégories restantes: ${remainingCategories}`);
    
    const remainingFarms = await db.collection('farms').countDocuments();
    console.log(`✅ Farms restantes: ${remainingFarms}`);
    
    const remainingProducts = await db.collection('products').countDocuments();
    console.log(`✅ Produits restants: ${remainingProducts}`);
    
    console.log('\n🎯 Résumé:');
    console.log('- Toutes les catégories ont été supprimées');
    console.log('- Toutes les farms ont été supprimées');
    console.log('- Tous les menus ont été supprimés (sauf CaliGaz)');
    console.log('- Les produits des autres menus ont été supprimés');
    
    console.log('\n✅ Nettoyage terminé avec succès!');
    console.log('💡 Vous pouvez maintenant créer vos propres catégories et farms depuis le panel admin.');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Connexion fermée');
  }
}

// Exécuter le script
cleanAllCollections();