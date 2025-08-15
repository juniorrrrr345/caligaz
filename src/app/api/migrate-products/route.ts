import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-fixed';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const { db } = await connectToDatabase();
    const productsCollection = db.collection('products');

    console.log('🔄 Migration des produits...');

    // Migrer les produits sans menu vers 'principal'
    const result = await productsCollection.updateMany(
      { menu: { $exists: false } },
      { $set: { menu: 'principal' } }
    );

    console.log(`✅ Migration terminée: ${result.modifiedCount} produits mis à jour`);

    return NextResponse.json({
      success: true,
      productsUpdated: result.modifiedCount,
      message: 'Migration des produits terminée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur migration produits:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la migration des produits'
    }, { status: 500 });
  }
}