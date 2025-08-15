const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixIndexes() {
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

    // Fix pour les CATÉGORIES
    console.log('\n📋 CORRECTION DES INDEX DES CATÉGORIES');
    console.log('=========================================');
    
    const categoriesCollection = db.collection('categories');
    
    // Lister les index existants
    const categoryIndexes = await categoriesCollection.indexes();
    console.log('Index actuels des catégories:');
    categoryIndexes.forEach(idx => {
      console.log(`  - ${JSON.stringify(idx.key)} (unique: ${idx.unique || false})`);
    });

    // Supprimer l'index problématique sur 'name' s'il existe
    try {
      await categoriesCollection.dropIndex('name_1');
      console.log('✅ Index name_1 supprimé pour les catégories');
    } catch (e) {
      console.log('ℹ️ Pas d\'index name_1 à supprimer pour les catégories');
    }

    // S'assurer que l'index correct existe (slug + menu)
    try {
      await categoriesCollection.createIndex(
        { slug: 1, menu: 1 }, 
        { unique: true, background: true }
      );
      console.log('✅ Index composé (slug, menu) créé/vérifié pour les catégories');
    } catch (e) {
      console.log('ℹ️ Index composé déjà existant pour les catégories');
    }

    // Fix pour les FARMS
    console.log('\n🏭 CORRECTION DES INDEX DES FARMS');
    console.log('====================================');
    
    const farmsCollection = db.collection('farms');
    
    // Lister les index existants
    const farmIndexes = await farmsCollection.indexes();
    console.log('Index actuels des farms:');
    farmIndexes.forEach(idx => {
      console.log(`  - ${JSON.stringify(idx.key)} (unique: ${idx.unique || false})`);
    });

    // Supprimer l'index problématique sur 'name' s'il existe
    try {
      await farmsCollection.dropIndex('name_1');
      console.log('✅ Index name_1 supprimé pour les farms');
    } catch (e) {
      console.log('ℹ️ Pas d\'index name_1 à supprimer pour les farms');
    }

    // S'assurer que l'index correct existe (slug + menu)
    try {
      await farmsCollection.createIndex(
        { slug: 1, menu: 1 }, 
        { unique: true, background: true }
      );
      console.log('✅ Index composé (slug, menu) créé/vérifié pour les farms');
    } catch (e) {
      console.log('ℹ️ Index composé déjà existant pour les farms');
    }

    // Vérifier les doublons existants
    console.log('\n🔍 VÉRIFICATION DES DOUBLONS');
    console.log('==============================');

    // Vérifier les catégories en double
    const duplicateCategories = await categoriesCollection.aggregate([
      { $group: { 
        _id: { name: "$name", menu: "$menu" }, 
        count: { $sum: 1 },
        ids: { $push: "$_id" }
      }},
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (duplicateCategories.length > 0) {
      console.log('⚠️ Catégories en double trouvées:');
      duplicateCategories.forEach(dup => {
        console.log(`  - "${dup._id.name}" dans menu "${dup._id.menu}" (${dup.count} fois)`);
      });
    } else {
      console.log('✅ Aucune catégorie en double');
    }

    // Vérifier les farms en double
    const duplicateFarms = await farmsCollection.aggregate([
      { $group: { 
        _id: { name: "$name", menu: "$menu" }, 
        count: { $sum: 1 },
        ids: { $push: "$_id" }
      }},
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (duplicateFarms.length > 0) {
      console.log('⚠️ Farms en double trouvées:');
      duplicateFarms.forEach(dup => {
        console.log(`  - "${dup._id.name}" dans menu "${dup._id.menu}" (${dup.count} fois)`);
      });
    } else {
      console.log('✅ Aucune farm en double');
    }

    // Afficher les index finaux
    console.log('\n📊 INDEX FINAUX');
    console.log('================');
    
    const finalCategoryIndexes = await categoriesCollection.indexes();
    console.log('Index des catégories:');
    finalCategoryIndexes.forEach(idx => {
      console.log(`  - ${JSON.stringify(idx.key)} (unique: ${idx.unique || false})`);
    });

    const finalFarmIndexes = await farmsCollection.indexes();
    console.log('\nIndex des farms:');
    finalFarmIndexes.forEach(idx => {
      console.log(`  - ${JSON.stringify(idx.key)} (unique: ${idx.unique || false})`);
    });

    console.log('\n✅ Correction des index terminée !');
    console.log('Vous pouvez maintenant créer des catégories et farms avec le même nom dans différents menus.');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
fixIndexes();