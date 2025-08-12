import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthResult {
  isAuthenticated: boolean;
  admin?: any;
}

export async function verifyAuth(req: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAuthenticated: false };
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return { 
        isAuthenticated: true, 
        admin: decoded 
      };
    } catch (error) {
      return { isAuthenticated: false };
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return { isAuthenticated: false };
  }
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}