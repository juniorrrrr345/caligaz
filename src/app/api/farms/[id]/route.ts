import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-fixed';
import { Farm } from '@/lib/models/Farm';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const farm = await Farm.findById(params.id);
    
    if (!farm) {
      return NextResponse.json({ error: 'Farm non trouvée' }, { status: 404 });
    }
    
    return NextResponse.json(farm);
  } catch (error) {
    console.error('Error fetching farm:', error);
    return NextResponse.json({ error: 'Failed to fetch farm' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 PUT Farm - ID reçu:', params.id);
    
    await connectDB();
    
    const data = await request.json();
    console.log('📝 Données reçues:', data);
    
    // Nettoyer les données
    const { _id, ...updateData } = data;
    
    console.log('🔄 Tentative de mise à jour avec:', updateData);
    
    const updatedFarm = await Farm.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedFarm) {
      console.log('❌ Farm non trouvée');
      return NextResponse.json({ error: 'Farm non trouvée' }, { status: 404 });
    }

    console.log('✅ Farm mise à jour avec succès');
    return NextResponse.json(updatedFarm);
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
    console.log('🔍 DELETE Farm - ID reçu:', params.id);
    
    await connectDB();
    
    const deletedFarm = await Farm.findByIdAndDelete(params.id);

    if (!deletedFarm) {
      console.log('⚠️ Farm non trouvée ou déjà supprimée');
      return NextResponse.json({ message: 'Farm non trouvée' }, { status: 404 });
    }

    console.log('✅ Farm supprimée avec succès');
    return NextResponse.json({ message: 'Farm supprimée avec succès', deleted: deletedFarm });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}