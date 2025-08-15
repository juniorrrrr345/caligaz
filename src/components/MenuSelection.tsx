'use client';

import { useState, useEffect } from 'react';
import { MenuType, MenuConfig } from '@/types';

interface MenuSelectionProps {
  onMenuSelect: (menu: MenuType) => void;
}

export default function MenuSelection({ onMenuSelect }: MenuSelectionProps) {
  const [menus, setMenus] = useState<MenuConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch('/api/menus');
        if (response.ok) {
          const menusData = await response.json();
          setMenus(menusData);
        }
      } catch (error) {
        console.error('Error fetching menus:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Chargement des menus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Choisissez votre menu</h1>
          <p className="text-gray-400">Sélectionnez le menu que vous souhaitez explorer</p>
        </div>

        <div className="space-y-4">
          {menus.map((menu) => (
            <button
              key={menu.type}
              onClick={() => onMenuSelect(menu.type)}
              className="w-full p-6 bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {menu.displayName}
                </h3>
                <div className="text-2xl mb-2">
                  {menu.type === 'principal' ? '⛽' : '🇪🇸'}
                </div>
                <p className="text-gray-400 text-sm">
                  {menu.type === 'principal' 
                    ? 'Accédez au menu principal CaliGaz' 
                    : 'Découvrez notre sélection Barcelone'
                  }
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Vous pourrez changer de menu à tout moment
          </p>
        </div>
      </div>
    </div>
  );
}