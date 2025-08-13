const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Schémas
const menuSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  emoji: String,
  isActive: Boolean,
  order: Number
});

const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  menu: String,
  order: Number,
  isActive: Boolean
});

const farmSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  menu: String,
  order: Number,
  isActive: Boolean
});

const Menu = mongoose.model('Menu', menuSchema);
const Category = mongoose.model('Category', categorySchema);
const Farm = mongoose.model('Farm', farmSchema);

async function initMenuData() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Données pour CaliGaz (menu principal)
    const caligazCategories = [
      { name: 'Carburants', slug: 'carburants', menu: 'caligaz', order: 1 },
      { name: 'Lubrifiants', slug: 'lubrifiants', menu: 'caligaz', order: 2 },
      { name: 'Accessoires Auto', slug: 'accessoires-auto', menu: 'caligaz', order: 3 },
      { name: 'Services', slug: 'services', menu: 'caligaz', order: 4 }
    ];

    const caligazFarms = [
      { name: 'Total', slug: 'total', menu: 'caligaz', order: 1 },
      { name: 'Shell', slug: 'shell', menu: 'caligaz', order: 2 },
      { name: 'BP', slug: 'bp', menu: 'caligaz', order: 3 },
      { name: 'Esso', slug: 'esso', menu: 'caligaz', order: 4 }
    ];

    // Données pour CaliGaz Barcelone
    const barceloneCategories = [
      { name: 'Combustibles', slug: 'combustibles', menu: 'caligaz-barcelone', order: 1 },
      { name: 'Aceites', slug: 'aceites', menu: 'caligaz-barcelone', order: 2 },
      { name: 'Accesorios', slug: 'accesorios', menu: 'caligaz-barcelone', order: 3 },
      { name: 'Servicios', slug: 'servicios', menu: 'caligaz-barcelone', order: 4 }
    ];

    const barceloneFarms = [
      { name: 'Repsol', slug: 'repsol', menu: 'caligaz-barcelone', order: 1 },
      { name: 'Cepsa', slug: 'cepsa', menu: 'caligaz-barcelone', order: 2 },
      { name: 'Galp', slug: 'galp', menu: 'caligaz-barcelone', order: 3 },
      { name: 'Petronor', slug: 'petronor', menu: 'caligaz-barcelone', order: 4 }
    ];

    // Insérer les catégories
    console.log('\n📂 Initialisation des catégories...');
    
    for (const cat of [...caligazCategories, ...barceloneCategories]) {
      try {
        await Category.findOneAndUpdate(
          { slug: cat.slug, menu: cat.menu },
          { ...cat, isActive: true },
          { upsert: true, new: true }
        );
        console.log(`✅ Catégorie "${cat.name}" (${cat.menu}) créée/mise à jour`);
      } catch (error) {
        console.error(`❌ Erreur pour la catégorie "${cat.name}":`, error.message);
      }
    }

    // Insérer les farms
    console.log('\n🏭 Initialisation des farms...');
    
    for (const farm of [...caligazFarms, ...barceloneFarms]) {
      try {
        await Farm.findOneAndUpdate(
          { slug: farm.slug, menu: farm.menu },
          { ...farm, isActive: true },
          { upsert: true, new: true }
        );
        console.log(`✅ Farm "${farm.name}" (${farm.menu}) créée/mise à jour`);
      } catch (error) {
        console.error(`❌ Erreur pour la farm "${farm.name}":`, error.message);
      }
    }

    // Afficher le résumé
    console.log('\n📊 Résumé:');
    
    const categoriesByMenu = await Category.aggregate([
      { $group: { _id: '$menu', count: { $sum: 1 } } }
    ]);
    console.log('Catégories par menu:');
    categoriesByMenu.forEach(group => {
      console.log(`  - ${group._id}: ${group.count} catégories`);
    });

    const farmsByMenu = await Farm.aggregate([
      { $group: { _id: '$menu', count: { $sum: 1 } } }
    ]);
    console.log('\nFarms par menu:');
    farmsByMenu.forEach(group => {
      console.log(`  - ${group._id}: ${group.count} farms`);
    });

    console.log('\n✅ Initialisation terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter le script
initMenuData();