import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-fixed';
import { getBotInfo } from '@/lib/telegram';

export async function GET() {
  const health: any = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      api: 'ok',
      database: 'checking',
      telegram: 'checking'
    },
    environment: process.env.NODE_ENV || 'development'
  };
  
  try {
    // Test de la base de données
    try {
      const { db } = await connectToDatabase();
      await db.admin().ping();
      health.services.database = 'ok';
    } catch (dbError: any) {
      health.services.database = 'error';
      health.errors = health.errors || {};
      health.errors.database = dbError.message;
    }
    
    // Test du bot Telegram
    try {
      const botInfo = await getBotInfo();
      if (botInfo) {
        health.services.telegram = 'ok';
        health.telegram = {
          username: botInfo.username,
          id: botInfo.id
        };
      } else {
        health.services.telegram = process.env.TELEGRAM_BOT_TOKEN ? 'error' : 'not_configured';
      }
    } catch (tgError: any) {
      health.services.telegram = 'error';
      health.errors = health.errors || {};
      health.errors.telegram = tgError.message;
    }
    
    // Déterminer le statut global
    const serviceStatuses = Object.values(health.services);
    if (serviceStatuses.every(s => s === 'ok')) {
      health.status = 'healthy';
    } else if (serviceStatuses.some(s => s === 'error')) {
      health.status = 'degraded';
    } else {
      health.status = 'partial';
    }
    
    // Ajouter des métriques mémoire
    const memUsage = process.memoryUsage();
    health.memory = {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
    };
    
    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503
    });
    
  } catch (error: any) {
    health.status = 'error';
    health.error = error.message;
    
    return NextResponse.json(health, { status: 503 });
  }
}