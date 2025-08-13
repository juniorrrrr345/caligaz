const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Modèles
const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  menu: String,
  order: Number,
  isActive: Boolean
});

const farmSchema = new mongoose.Schema({
  name: String,
  slug: String,
  menu: String,
  order: Number,
  isActive: Boolean
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Farm = mongoose.models.Farm || mongoose.model('Farm', farmSchema);

async function testMenuFiltering() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Créer des catégories de test pour CaliGaz
    console.log('📝 Création de catégories pour CaliGaz...');
    const caligazCategories = [
      { name: 'Essence', slug: 'essence', menu: 'caligaz', order: 1, isActive: true },
      { name: 'Diesel', slug: 'diesel', menu: 'caligaz', order: 2, isActive: true },
      { name: 'GPL', slug: 'gpl', menu: 'caligaz', order: 3, isActive: true }
    ];

    for (const cat of caligazCategories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug, menu: cat.menu },
        cat,
        { upsert: true, new: true }
      );
      console.log(`  ✅ Catégorie créée: ${cat.name} (menu: ${cat.menu})`);
    }

    // Créer des catégories de test pour CaliGaz Barcelone
    console.log('\n📝 Création de catégories pour CaliGaz Barcelone...');
    const barcelonaCategories = [
      { name: 'Gasolina', slug: 'gasolina', menu: 'caligaz-barcelone', order: 1, isActive: true },
      { name: 'Gasóleo', slug: 'gasoleo', menu: 'caligaz-barcelone', order: 2, isActive: true },
      { name: 'GLP', slug: 'glp', menu: 'caligaz-barcelone', order: 3, isActive: true }
    ];

    for (const cat of barcelonaCategories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug, menu: cat.menu },
        cat,
        { upsert: true, new: true }
      );
      console.log(`  ✅ Catégorie créée: ${cat.name} (menu: ${cat.menu})`);
    }

    // Créer des farms de test pour CaliGaz
    console.log('\n📝 Création de farms pour CaliGaz...');
    const caligazFarms = [
      { name: 'Total', slug: 'total', menu: 'caligaz', order: 1, isActive: true },
      { name: 'Shell', slug: 'shell', menu: 'caligaz', order: 2, isActive: true },
      { name: 'BP', slug: 'bp', menu: 'caligaz', order: 3, isActive: true }
    ];

    for (const farm of caligazFarms) {
      await Farm.findOneAndUpdate(
        { slug: farm.slug, menu: farm.menu },
        farm,
        { upsert: true, new: true }
      );
      console.log(`  ✅ Farm créée: ${farm.name} (menu: ${farm.menu})`);
    }

    // Créer des farms de test pour CaliGaz Barcelone
    console.log('\n📝 Création de farms pour CaliGaz Barcelone...');
    const barcelonaFarms = [
      { name: 'Repsol', slug: 'repsol', menu: 'caligaz-barcelone', order: 1, isActive: true },
      { name: 'Cepsa', slug: 'cepsa', menu: 'caligaz-barcelone', order: 2, isActive: true },
      { name: 'Galp', slug: 'galp', menu: 'caligaz-barcelone', order: 3, isActive: true }
    ];

    for (const farm of barcelonaFarms) {
      await Farm.findOneAndUpdate(
        { slug: farm.slug, menu: farm.menu },
        farm,
        { upsert: true, new: true }
      );
      console.log(`  ✅ Farm créée: ${farm.name} (menu: ${farm.menu})`);
    }

    // Vérification
    console.log('\n📊 Vérification du filtrage:');
    
    const allCategories = await Category.find({});
    const allFarms = await Farm.find({});
    
    console.log(`\n  Total catégories: ${allCategories.length}`);
    console.log(`  Total farms: ${allFarms.length}`);
    
    const caligazCats = await Category.find({ menu: 'caligaz' });
    const caligazFms = await Farm.find({ menu: 'caligaz' });
    console.log(`\n  CaliGaz - Catégories: ${caligazCats.length}, Farms: ${caligazFms.length}`);
    console.log(`    Catégories: ${caligazCats.map(c => c.name).join(', ')}`);
    console.log(`    Farms: ${caligazFms.map(f => f.name).join(', ')}`);
    
    const barcelonaCats = await Category.find({ menu: 'caligaz-barcelone' });
    const barcelonaFms = await Farm.find({ menu: 'caligaz-barcelone' });
    console.log(`\n  CaliGaz Barcelone - Catégories: ${barcelonaCats.length}, Farms: ${barcelonaFms.length}`);
    console.log(`    Catégories: ${barcelonaCats.map(c => c.name).join(', ')}`);
    console.log(`    Farms: ${barcelonaFms.map(f => f.name).join(', ')}`);

    console.log('\n✅ Test terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnexion de MongoDB');
  }
}

// Exécuter le script
testMenuFiltering();