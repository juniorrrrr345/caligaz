const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://lmvrtt2:ALcWY4mLHwvtz1X2@lmvrtt.km9x4q9.mongodb.net/lmvrtt_shop?retryWrites=true&w=majority&appName=LMVRTT';

async function testDelete() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    const db = mongoose.connection.db;
    const { ObjectId } = require('mongodb');
    
    // 1. Créer une catégorie de test
    console.log('\n📝 Création d\'une catégorie de test...');
    const testCategory = {
      name: 'Test Category',
      slug: 'test-category',
      menu: 'caligaz',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const insertResult = await db.collection('categories').insertOne(testCategory);
    console.log('✅ Catégorie créée avec ID:', insertResult.insertedId);
    
    // 2. Vérifier qu'elle existe
    const found = await db.collection('categories').findOne({ _id: insertResult.insertedId });
    console.log('🔍 Catégorie trouvée:', found ? 'OUI' : 'NON');
    
    // 3. Tenter de la supprimer
    console.log('\n🗑️ Tentative de suppression...');
    const deleteResult = await db.collection('categories').deleteOne({ _id: insertResult.insertedId });
    console.log('📊 Résultat de suppression:', {
      acknowledged: deleteResult.acknowledged,
      deletedCount: deleteResult.deletedCount
    });
    
    // 4. Vérifier qu'elle n'existe plus
    const stillExists = await db.collection('categories').findOne({ _id: insertResult.insertedId });
    console.log('🔍 Catégorie encore présente:', stillExists ? 'OUI ⚠️' : 'NON ✅');
    
    if (deleteResult.deletedCount > 0 && !stillExists) {
      console.log('\n✅ Test réussi: La suppression fonctionne correctement!');
    } else {
      console.log('\n❌ Test échoué: La suppression ne fonctionne pas!');
    }
    
    // 5. Lister toutes les catégories restantes
    console.log('\n📋 Catégories restantes dans la base:');
    const allCategories = await db.collection('categories').find({}).toArray();
    console.log(`Total: ${allCategories.length} catégorie(s)`);
    allCategories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat._id})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Connexion fermée');
  }
}

// Exécuter le test
testDelete();