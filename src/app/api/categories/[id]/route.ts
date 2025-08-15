import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-fixed';
import { Category } from '@/lib/models/Category';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const category = await Category.findById(params.id);
    
    if (!category) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 PUT Catégorie - ID reçu:', params.id);
    
    await connectDB();
    
    const data = await request.json();
    console.log('📝 Données reçues:', data);
    
    // Nettoyer les données
    const { _id, ...updateData } = data;
    
    console.log('🔄 Tentative de mise à jour avec:', updateData);
    
    const updatedCategory = await Category.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      console.log('❌ Catégorie non trouvée');
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }

    console.log('✅ Catégorie mise à jour avec succès');
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('❌ Erreur lors de la modification:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la modification',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 DELETE Catégorie - ID reçu:', params.id);
    
    await connectDB();
    
    const deletedCategory = await Category.findByIdAndDelete(params.id);

    if (!deletedCategory) {
      console.log('⚠️ Catégorie non trouvée ou déjà supprimée');
      return NextResponse.json({ message: 'Catégorie non trouvée' }, { status: 404 });
    }

    console.log('✅ Catégorie supprimée avec succès');
    return NextResponse.json({ message: 'Catégorie supprimée avec succès', deleted: deletedCategory });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}