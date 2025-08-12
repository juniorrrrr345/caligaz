import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { Menu } from '../../../../lib/models/Menu';
import { verifyAuth } from '../../../../lib/auth';

// GET - Récupérer tous les menus
export async function GET() {
  try {
    await connectDB();
    const menus = await Menu.find({ isActive: true }).sort({ order: 1 });
    return NextResponse.json(menus);
  } catch (error) {
    console.error('Erreur lors de la récupération des menus:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des menus' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau menu (Admin seulement)
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    
    // Générer le slug si non fourni
    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const menu = new Menu(data);
    await menu.save();
    
    return NextResponse.json(menu, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors de la création du menu:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Un menu avec ce nom existe déjà' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erreur lors de la création du menu' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un menu (Admin seulement)
export async function PUT(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();
    const { id, ...data } = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du menu requis' },
        { status: 400 }
      );
    }

    const menu = await Menu.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du menu:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du menu' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un menu (Admin seulement)
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du menu requis' },
        { status: 400 }
      );
    }

    // Ne pas supprimer le menu par défaut
    const menu = await Menu.findById(id);
    if (menu?.slug === 'caligaz') {
      return NextResponse.json(
        { error: 'Le menu principal ne peut pas être supprimé' },
        { status: 400 }
      );
    }

    await Menu.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du menu:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du menu' },
      { status: 500 }
    );
  }
}