import { NextRequest, NextResponse } from 'next/server';
import { getBotInfo } from '@/lib/telegram';
import { connectToDatabase } from '@/lib/mongodb-fixed';

// Cette route peut être appelée par un service de cron externe (comme cron-job.org)
// ou par Vercel Cron si vous avez un plan Pro
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'autorisation (optionnel mais recommandé)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const results = {
      timestamp: new Date().toISOString(),
      checks: {
        database: false,
        telegram: false
      }
    };
    
    // Ping la base de données pour la maintenir active
    try {
      const { db } = await connectToDatabase();
      await db.admin().ping();
      results.checks.database = true;
      
      // Nettoyer les vieilles données si nécessaire
      // Par exemple, supprimer les logs de plus de 30 jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Si vous avez une collection de logs
      // await db.collection('logs').deleteMany({
      //   createdAt: { $lt: thirtyDaysAgo }
      // });
      
    } catch (dbError: any) {
      console.error('Erreur database keep-alive:', dbError);
    }
    
    // Vérifier que le bot Telegram est toujours actif
    try {
      const botInfo = await getBotInfo();
      if (botInfo) {
        results.checks.telegram = true;
        console.log(`✅ Bot Telegram actif: @${botInfo.username}`);
      } else {
        console.warn('⚠️ Bot Telegram non accessible');
      }
    } catch (tgError: any) {
      console.error('Erreur Telegram keep-alive:', tgError);
    }
    
    // Logger l'activité
    console.log('🔄 Keep-alive exécuté:', results);
    
    return NextResponse.json({
      success: true,
      message: 'Keep-alive completed',
      results
    });
    
  } catch (error: any) {
    console.error('Erreur dans keep-alive:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}