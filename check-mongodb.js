const { MongoClient } = require('mongodb');

async function checkDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://juniorrrrr345:UY9T5SG3r3sHjnCU@caligaz.6ndhk.mongodb.net/caligaz?retryWrites=true&w=majority';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connecté à MongoDB');
    
    const db = client.db('caligaz');
    
    // Vérifier les menus
    console.log('\n📋 === MENUS ===');
    const menus = await db.collection('menus').find({}).toArray();
    menus.forEach(menu => {
      console.log(`- ${menu.name} (slug: ${menu.slug})`);
    });
    
    // Vérifier les catégories
    console.log('\n🏷️ === CATÉGORIES ===');
    const categories = await db.collection('categories').find({}).toArray();
    
    // Grouper par menu
    const categoriesByMenu = {};
    categories.forEach(cat => {
      const menuName = cat.menu || 'SANS MENU';
      if (!categoriesByMenu[menuName]) {
        categoriesByMenu[menuName] = [];
      }
      categoriesByMenu[menuName].push(cat.name);
    });
    
    Object.entries(categoriesByMenu).forEach(([menu, cats]) => {
      console.log(`\nMenu "${menu}":`);
      cats.forEach(cat => console.log(`  - ${cat}`));
    });
    
    // Vérifier les farms
    console.log('\n🏭 === FARMS ===');
    const farms = await db.collection('farms').find({}).toArray();
    
    // Grouper par menu
    const farmsByMenu = {};
    farms.forEach(farm => {
      const menuName = farm.menu || 'SANS MENU';
      if (!farmsByMenu[menuName]) {
        farmsByMenu[menuName] = [];
      }
      farmsByMenu[menuName].push(farm.name);
    });
    
    Object.entries(farmsByMenu).forEach(([menu, farms]) => {
      console.log(`\nMenu "${menu}":`);
      farms.forEach(farm => console.log(`  - ${farm}`));
    });
    
    // Vérifier s'il y a des catégories/farms sans menu
    console.log('\n⚠️ === PROBLÈMES POTENTIELS ===');
    const catsSansMenu = categories.filter(c => !c.menu);
    const farmsSansMenu = farms.filter(f => !f.menu);
    
    if (catsSansMenu.length > 0) {
      console.log(`❌ ${catsSansMenu.length} catégorie(s) sans menu:`, catsSansMenu.map(c => c.name));
    }
    
    if (farmsSansMenu.length > 0) {
      console.log(`❌ ${farmsSansMenu.length} farm(s) sans menu:`, farmsSansMenu.map(f => f.name));
    }
    
    if (catsSansMenu.length === 0 && farmsSansMenu.length === 0) {
      console.log('✅ Toutes les catégories et farms ont un menu assigné');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
    console.log('\n👋 Connexion fermée');
  }
}

checkDatabase();