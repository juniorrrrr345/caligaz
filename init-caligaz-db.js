const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://caligaz641:laVfS1ZDvnGFrQjs@caligaz.w8db4kp.mongodb.net/caligaz?retryWrites=true&w=majority&appName=caligaz';

// Schéma Menu
const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

async function initDatabase() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const Menu = mongoose.model('Menu', menuSchema);

    // Vérifier si les menus existent déjà
    const existingMenus = await Menu.find({});
    console.log(`📊 Menus existants: ${existingMenus.length}`);

    if (existingMenus.length === 0) {
      // Créer les menus de base
      const menus = [
        { name: 'CaliGaz', slug: 'caligaz', isActive: true },
        { name: 'CaliGaz Barcelone', slug: 'caligaz-barcelone', isActive: true }
      ];

      for (const menuData of menus) {
        const menu = new Menu(menuData);
        await menu.save();
        console.log(`✅ Menu créé: ${menu.name} (${menu.slug})`);
      }
    } else {
      console.log('ℹ️ Les menus existent déjà:');
      existingMenus.forEach(menu => {
        console.log(`  - ${menu.name} (${menu.slug})`);
      });
    }

    // Afficher les stats
    const categories = await mongoose.connection.db.collection('categories').find({}).toArray();
    const farms = await mongoose.connection.db.collection('farms').find({}).toArray();
    
    console.log('\n📊 État de la base de données:');
    console.log(`  - Menus: ${existingMenus.length || 2}`);
    console.log(`  - Catégories: ${categories.length}`);
    console.log(`  - Farms: ${farms.length}`);

    if (categories.length > 0) {
      console.log('\n📂 Catégories par menu:');
      const categoriesByMenu = {};
      categories.forEach(cat => {
        if (!categoriesByMenu[cat.menu]) {
          categoriesByMenu[cat.menu] = [];
        }
        categoriesByMenu[cat.menu].push(cat.name);
      });
      
      Object.entries(categoriesByMenu).forEach(([menu, cats]) => {
        console.log(`  ${menu}: ${cats.join(', ')}`);
      });
    }

    if (farms.length > 0) {
      console.log('\n🏭 Farms par menu:');
      const farmsByMenu = {};
      farms.forEach(farm => {
        if (!farmsByMenu[farm.menu]) {
          farmsByMenu[farm.menu] = [];
        }
        farmsByMenu[farm.menu].push(farm.name);
      });
      
      Object.entries(farmsByMenu).forEach(([menu, farmsList]) => {
        console.log(`  ${menu}: ${farmsList.join(', ')}`);
      });
    }

    console.log('\n✅ Base de données initialisée avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

initDatabase();