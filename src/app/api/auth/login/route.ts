import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    console.log('Tentative de connexion:', email);
    
    // Vérifier les credentials depuis les variables d'environnement
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@caligaz.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Pour simplifier, on compare directement (en production, il faudrait utiliser bcrypt)
    if (email === adminEmail && password === adminPassword) {
      // Générer un token JWT
      const token = generateToken({
        email: adminEmail,
        role: 'admin',
        timestamp: Date.now()
      });
      
      console.log('Connexion réussie, token généré');
      
      return NextResponse.json({
        success: true,
        token,
        message: 'Connexion réussie'
      });
    }
    
    console.log('Identifiants invalides');
    return NextResponse.json(
      { success: false, message: 'Identifiants invalides' },
      { status: 401 }
    );
    
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}