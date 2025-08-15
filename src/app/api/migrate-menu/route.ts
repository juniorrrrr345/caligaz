import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-fixed';
import Category from '@/models/Category';
import Farm from '@/models/Farm';

export async function POST() {
  try {
    await connectDB();
    
    console.log('🔄 Migration des menus...');
    
    // Migrer les catégories sans menu vers 'principal'
    const categoriesUpdated = await Category.updateMany(
      { menu: { $exists: false } },
      { $set: { menu: 'principal' } }
    );
    
    // Migrer les farms sans menu vers 'principal'
    const farmsUpdated = await Farm.updateMany(
      { menu: { $exists: false } },
      { $set: { menu: 'principal' } }
    );
    
    console.log(`✅ Migration terminée: ${categoriesUpdated.modifiedCount} catégories, ${farmsUpdated.modifiedCount} farms`);
    
    return NextResponse.json({ 
      success: true,
      categoriesUpdated: categoriesUpdated.modifiedCount,
      farmsUpdated: farmsUpdated.modifiedCount,
      message: 'Migration des menus terminée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur migration:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Erreur lors de la migration' 
    }, { status: 500 });
  }
}