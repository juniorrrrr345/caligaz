const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://lmvrtt2:ALcWY4mLHwvtz1X2@lmvrtt.km9x4q9.mongodb.net/lmvrtt_shop?retryWrites=true&w=majority&appName=LMVRTT';

async function cleanUnwantedMenus() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔗 Connexion à MongoDB...');
    await client.connect();
    const db = client.db();
    
    console.log('✅ Connecté à MongoDB');
    
    // Menus à supprimer
    const menusToDelete = ['france', 'barcelone'];
    
    // Catégories à supprimer (par slug)
    const categoriesToDelete = [
      'essence', 'diesel', 'gpl',  // France
      'gasolina', 'gasoleo', 'glp'  // Barcelone
    ];
    
    // 1. Supprimer les menus
    console.log('\n📋 Suppression des menus...');
    for (const menuSlug of menusToDelete) {
      const result = await db.collection('menus').deleteOne({ slug: menuSlug });
      if (result.deletedCount > 0) {
        console.log(`✅ Menu "${menuSlug}" supprimé`);
      } else {
        console.log(`⚠️ Menu "${menuSlug}" non trouvé`);
      }
    }
    
    // 2. Supprimer les catégories par slug
    console.log('\n🏷️ Suppression des catégories par slug...');
    for (const categorySlug of categoriesToDelete) {
      const result = await db.collection('categories').deleteOne({ slug: categorySlug });
      if (result.deletedCount > 0) {
        console.log(`✅ Catégorie "${categorySlug}" supprimée`);
      } else {
        console.log(`⚠️ Catégorie "${categorySlug}" non trouvée`);
      }
    }
    
    // 3. Supprimer aussi les catégories par menu (au cas où)
    console.log('\n🏷️ Suppression des catégories par menu...');
    for (const menu of menusToDelete) {
      const result = await db.collection('categories').deleteMany({ menu: menu });
      if (result.deletedCount > 0) {
        console.log(`✅ ${result.deletedCount} catégorie(s) du menu "${menu}" supprimée(s)`);
      }
    }
    
    // 4. Supprimer les farms associées à ces menus
    console.log('\n🏭 Suppression des farms associées...');
    for (const menu of menusToDelete) {
      const result = await db.collection('farms').deleteMany({ menu: menu });
      if (result.deletedCount > 0) {
        console.log(`✅ ${result.deletedCount} farm(s) du menu "${menu}" supprimée(s)`);
      }
    }
    
    // 5. Supprimer les produits associés à ces menus
    console.log('\n📦 Suppression des produits associés...');
    for (const menu of menusToDelete) {
      const result = await db.collection('products').deleteMany({ menu: menu });
      if (result.deletedCount > 0) {
        console.log(`✅ ${result.deletedCount} produit(s) du menu "${menu}" supprimé(s)`);
      }
    }
    
    // 6. Vérifier ce qui reste
    console.log('\n📊 Vérification des données restantes...');
    const remainingMenus = await db.collection('menus').find({}).toArray();
    console.log(`\n✅ Menus restants: ${remainingMenus.map(m => m.name || m.slug).join(', ') || 'Aucun'}`);
    
    const remainingCategories = await db.collection('categories').find({}).toArray();
    console.log(`✅ Catégories restantes: ${remainingCategories.length}`);
    if (remainingCategories.length > 0) {
      const categoriesByMenu = {};
      remainingCategories.forEach(cat => {
        const menu = cat.menu || 'sans-menu';
        if (!categoriesByMenu[menu]) categoriesByMenu[menu] = [];
        categoriesByMenu[menu].push(cat.name || cat.slug);
      });
      
      Object.entries(categoriesByMenu).forEach(([menu, cats]) => {
        console.log(`   - Menu "${menu}": ${cats.join(', ')}`);
      });
    }
    
    console.log('\n✅ Nettoyage terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
    console.log('\n👋 Connexion fermée');
  }
}

// Exécuter le script
cleanUnwantedMenus();