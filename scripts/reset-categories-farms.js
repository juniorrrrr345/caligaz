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

async function resetCategoriesAndFarms() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Supprimer toutes les catégories
    console.log('\n🗑️ Suppression de toutes les catégories...');
    const deletedCategories = await Category.deleteMany({});
    console.log(`✅ ${deletedCategories.deletedCount} catégories supprimées`);

    // Supprimer toutes les farms
    console.log('\n🗑️ Suppression de toutes les farms...');
    const deletedFarms = await Farm.deleteMany({});
    console.log(`✅ ${deletedFarms.deletedCount} farms supprimées`);

    // Vérification
    console.log('\n📊 Vérification du nettoyage:');
    const remainingCategories = await Category.countDocuments();
    const remainingFarms = await Farm.countDocuments();
    
    console.log(`  - Catégories restantes: ${remainingCategories}`);
    console.log(`  - Farms restantes: ${remainingFarms}`);

    if (remainingCategories === 0 && remainingFarms === 0) {
      console.log('\n✅ Base de données nettoyée avec succès!');
      console.log('   Les catégories et farms sont maintenant à zéro.');
    } else {
      console.log('\n⚠️ Attention: Il reste encore des données!');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnexion de MongoDB');
  }
}

// Exécuter le script
resetCategoriesAndFarms();