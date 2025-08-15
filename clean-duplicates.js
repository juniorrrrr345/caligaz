const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function cleanDuplicates() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('❌ MONGODB_URI non trouvé dans les variables d\'environnement');
    }

    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    const db = mongoose.connection.db;

    // AFFICHER TOUTES LES CATÉGORIES
    console.log('\n📋 TOUTES LES CATÉGORIES DANS LA BASE');
    console.log('========================================');
    
    const categoriesCollection = db.collection('categories');
    const allCategories = await categoriesCollection.find({}).toArray();
    
    console.log(`Total: ${allCategories.length} catégories`);
    allCategories.forEach(cat => {
      console.log(`  - ID: ${cat._id}`);
      console.log(`    Nom: "${cat.name}"`);
      console.log(`    Menu: ${cat.menu}`);
      console.log(`    Slug: ${cat.slug}`);
      console.log(`    Active: ${cat.isActive !== false ? 'OUI' : 'NON'}`);
      console.log('    ---');
    });

    // AFFICHER TOUTES LES FARMS
    console.log('\n🏭 TOUTES LES FARMS DANS LA BASE');
    console.log('===================================');
    
    const farmsCollection = db.collection('farms');
    const allFarms = await farmsCollection.find({}).toArray();
    
    console.log(`Total: ${allFarms.length} farms`);
    allFarms.forEach(farm => {
      console.log(`  - ID: ${farm._id}`);
      console.log(`    Nom: "${farm.name}"`);
      console.log(`    Menu: ${farm.menu}`);
      console.log(`    Slug: ${farm.slug}`);
      console.log(`    Active: ${farm.isActive !== false ? 'OUI' : 'NON'}`);
      console.log('    ---');
    });

    // CHERCHER LES DOUBLONS
    console.log('\n🔍 RECHERCHE DE DOUBLONS');
    console.log('==========================');

    // Doublons de catégories par nom
    const duplicateCategories = await categoriesCollection.aggregate([
      { $group: { 
        _id: "$name", 
        count: { $sum: 1 },
        items: { $push: { id: "$_id", menu: "$menu", isActive: "$isActive" } }
      }},
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (duplicateCategories.length > 0) {
      console.log('\n⚠️ CATÉGORIES EN DOUBLE (par nom):');
      for (const dup of duplicateCategories) {
        console.log(`\n  Nom: "${dup._id}" (${dup.count} fois)`);
        dup.items.forEach(item => {
          console.log(`    - ID: ${item.id}, Menu: ${item.menu}, Active: ${item.isActive !== false}`);
        });
        
        // Demander si on veut nettoyer
        console.log(`  → Gardant seulement la première, suppression des autres...`);
        const idsToDelete = dup.items.slice(1).map(item => item.id);
        const deleteResult = await categoriesCollection.deleteMany({ 
          _id: { $in: idsToDelete } 
        });
        console.log(`  ✅ ${deleteResult.deletedCount} doublons supprimés`);
      }
    } else {
      console.log('✅ Aucun doublon de catégories trouvé');
    }

    // Doublons de farms par nom
    const duplicateFarms = await farmsCollection.aggregate([
      { $group: { 
        _id: "$name", 
        count: { $sum: 1 },
        items: { $push: { id: "$_id", menu: "$menu", isActive: "$isActive" } }
      }},
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (duplicateFarms.length > 0) {
      console.log('\n⚠️ FARMS EN DOUBLE (par nom):');
      for (const dup of duplicateFarms) {
        console.log(`\n  Nom: "${dup._id}" (${dup.count} fois)`);
        dup.items.forEach(item => {
          console.log(`    - ID: ${item.id}, Menu: ${item.menu}, Active: ${item.isActive !== false}`);
        });
        
        // Demander si on veut nettoyer
        console.log(`  → Gardant seulement la première, suppression des autres...`);
        const idsToDelete = dup.items.slice(1).map(item => item.id);
        const deleteResult = await farmsCollection.deleteMany({ 
          _id: { $in: idsToDelete } 
        });
        console.log(`  ✅ ${deleteResult.deletedCount} doublons supprimés`);
      }
    } else {
      console.log('✅ Aucun doublon de farms trouvé');
    }

    // RÉSUMÉ FINAL
    console.log('\n📊 RÉSUMÉ APRÈS NETTOYAGE');
    console.log('===========================');
    
    const finalCategories = await categoriesCollection.countDocuments({});
    const activeCats = await categoriesCollection.countDocuments({ isActive: { $ne: false } });
    console.log(`Catégories: ${finalCategories} total (${activeCats} actives)`);
    
    const finalFarms = await farmsCollection.countDocuments({});
    const activeFarms = await farmsCollection.countDocuments({ isActive: { $ne: false } });
    console.log(`Farms: ${finalFarms} total (${activeFarms} actives)`);

    console.log('\n✅ Nettoyage terminé !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
cleanDuplicates();