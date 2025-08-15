import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-fixed';

export async function GET() {
  try {
    console.log('🔧 Début de la correction de la base de données...');
    
    const { db } = await connectToDatabase();
    
    const results = {
      categoriesFixed: false,
      farmsFixed: false,
      duplicatesRemoved: 0,
      indexesFixed: [],
      errors: []
    };

    // 1. CORRECTION DES INDEX DES CATÉGORIES
    console.log('📋 Correction des catégories...');
    try {
      const categoriesCollection = db.collection('categories');
      
      // Lister les index existants
      const indexes = await categoriesCollection.indexes();
      console.log('Index actuels:', indexes.map(i => i.name));
      
      // Supprimer l'index problématique sur 'name' s'il existe
      for (const index of indexes) {
        if (index.key && index.key.name === 1 && Object.keys(index.key).length === 1) {
          try {
            await categoriesCollection.dropIndex('name_1');
            console.log('✅ Index name_1 supprimé');
            results.indexesFixed.push('Suppression index name_1 sur categories');
          } catch (e) {
            console.log('Pas d\'index name_1 à supprimer');
          }
        }
      }
      
      // Supprimer les doublons de catégories
      const duplicates = await categoriesCollection.aggregate([
        { $group: { 
          _id: "$name", 
          count: { $sum: 1 },
          ids: { $push: "$_id" }
        }},
        { $match: { count: { $gt: 1 } } }
      ]).toArray();
      
      for (const dup of duplicates) {
        const idsToDelete = dup.ids.slice(1); // Garder seulement le premier
        const deleteResult = await categoriesCollection.deleteMany({ 
          _id: { $in: idsToDelete } 
        });
        results.duplicatesRemoved += deleteResult.deletedCount;
        console.log(`✅ ${deleteResult.deletedCount} doublons de "${dup._id}" supprimés`);
      }
      
      results.categoriesFixed = true;
    } catch (error) {
      console.error('Erreur catégories:', error);
      results.errors.push(`Catégories: ${error}`);
    }

    // 2. CORRECTION DES INDEX DES FARMS
    console.log('🏭 Correction des farms...');
    try {
      const farmsCollection = db.collection('farms');
      
      // Lister les index existants
      const indexes = await farmsCollection.indexes();
      console.log('Index actuels farms:', indexes.map(i => i.name));
      
      // Supprimer l'index problématique sur 'name' s'il existe
      for (const index of indexes) {
        if (index.key && index.key.name === 1 && Object.keys(index.key).length === 1) {
          try {
            await farmsCollection.dropIndex('name_1');
            console.log('✅ Index name_1 supprimé pour farms');
            results.indexesFixed.push('Suppression index name_1 sur farms');
          } catch (e) {
            console.log('Pas d\'index name_1 à supprimer pour farms');
          }
        }
      }
      
      // Supprimer les doublons de farms
      const duplicates = await farmsCollection.aggregate([
        { $group: { 
          _id: "$name", 
          count: { $sum: 1 },
          ids: { $push: "$_id" }
        }},
        { $match: { count: { $gt: 1 } } }
      ]).toArray();
      
      for (const dup of duplicates) {
        const idsToDelete = dup.ids.slice(1); // Garder seulement le premier
        const deleteResult = await farmsCollection.deleteMany({ 
          _id: { $in: idsToDelete } 
        });
        results.duplicatesRemoved += deleteResult.deletedCount;
        console.log(`✅ ${deleteResult.deletedCount} doublons de farm "${dup._id}" supprimés`);
      }
      
      results.farmsFixed = true;
    } catch (error) {
      console.error('Erreur farms:', error);
      results.errors.push(`Farms: ${error}`);
    }

    // 3. STATISTIQUES FINALES
    const categoriesCount = await db.collection('categories').countDocuments({});
    const farmsCount = await db.collection('farms').countDocuments({});
    
    const response = {
      success: true,
      message: '✅ Base de données corrigée avec succès!',
      details: {
        categoriesFixed: results.categoriesFixed,
        farmsFixed: results.farmsFixed,
        duplicatesRemoved: results.duplicatesRemoved,
        indexesFixed: results.indexesFixed,
        totalCategories: categoriesCount,
        totalFarms: farmsCount,
        errors: results.errors
      }
    };

    console.log('✅ Correction terminée:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Erreur lors de la correction de la base de données',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}