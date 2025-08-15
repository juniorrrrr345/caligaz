import { NextResponse } from 'next/server';
import { MenuConfig } from '@/types';

const AVAILABLE_MENUS: MenuConfig[] = [
  {
    type: 'principal',
    name: 'principal',
    displayName: 'Menu Principal (CaliGaz)'
  },
  {
    type: 'barcelone',
    name: 'barcelone', 
    displayName: 'Barcelone'
  }
];

export async function GET() {
  try {
    return NextResponse.json(AVAILABLE_MENUS, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching menus:', error);
    return NextResponse.json({ error: 'Failed to fetch menus' }, { status: 500 });
  }
}