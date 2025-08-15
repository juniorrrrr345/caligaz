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
      <div className="main-container">
        <div className="global-overlay"></div>
        <div className="content-layer">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p>Chargement des menus...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="global-overlay"></div>
      <div className="content-layer">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <div className="text-center bg-black/60 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/20">
              
              {/* Logo CaliGaz */}
              <div className="mb-8">
                <img 
                  src="https://i.imgur.com/xLGPJh0.jpeg" 
                  alt="CaliGaz" 
                  className="h-24 sm:h-32 w-auto mx-auto mb-6"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}
                />
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">CaliGaz</h1>
                <h2 className="text-xl sm:text-2xl text-white mb-4 font-semibold">Choisissez votre menu</h2>
                <p className="text-gray-400">Sélectionnez le menu que vous souhaitez explorer</p>
              </div>

              <div className="space-y-4">
                {menus.map((menu) => (
                  <button
                    key={menu.type}
                    onClick={() => onMenuSelect(menu.type)}
                    className="w-full p-6 bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-white/20 rounded-xl hover:from-gray-800/80 hover:to-gray-700/80 transition-all duration-300 transform hover:scale-105 hover:shadow-xl backdrop-blur-sm"
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-3">
                        {menu.type === 'principal' ? '⛽' : '🇪🇸'}
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {menu.displayName}
                      </h3>
                      <p className="text-gray-300 text-sm">
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
                <p className="text-gray-400 text-sm">
                  Vous pourrez changer de menu à tout moment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}