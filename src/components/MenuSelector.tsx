'use client';
import { useMenu } from '@/contexts/MenuContext';
import { ChevronRight, Store } from 'lucide-react';

interface MenuSelectorProps {
  onMenuSelected: () => void;
}

export default function MenuSelector({ onMenuSelected }: MenuSelectorProps) {
  const { menus, selectMenu, loading } = useMenu();

  const handleMenuSelect = (menu: any) => {
    selectMenu(menu);
    onMenuSelected();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white">Chargement des menus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      {/* Overlay global toujours présent */}
      <div className="global-overlay"></div>
      
      {/* Contenu principal */}
      <div className="content-layer min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <img 
            src="https://i.imgur.com/F1Hopru.jpeg" 
            alt="CaliGaz" 
            className="h-24 sm:h-32 w-auto mx-auto mb-4"
            style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Bienvenue chez CaliGaz ⛽️
          </h1>
          <p className="text-gray-400 text-lg">
            Choisissez votre menu pour continuer
          </p>
        </div>

        {/* Menus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menus.map((menu) => (
            <button
              key={menu._id}
              onClick={() => handleMenuSelect(menu)}
              className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-white/10 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20"
            >
              {/* Effet de brillance */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                {/* Emoji et titre */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {menu.emoji && (
                      <span className="text-4xl">{menu.emoji}</span>
                    )}
                    <h2 className="text-2xl font-bold text-white">
                      {menu.name}
                    </h2>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-500 group-hover:text-green-500 transition-colors" />
                </div>

                {/* Description */}
                <p className="text-gray-400 text-left mb-6">
                  {menu.description}
                </p>

                {/* Badge */}
                {menu.slug === 'caligaz' ? (
                  <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                    <Store className="w-4 h-4" />
                    Menu Principal
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                    <Store className="w-4 h-4" />
                    Menu Spécial
                  </div>
                )}
              </div>

              {/* Effet de hover */}
              <div className="absolute inset-0 rounded-2xl ring-2 ring-green-500 ring-opacity-0 group-hover:ring-opacity-50 transition-all duration-300"></div>
            </button>
          ))}
        </div>

        {/* Message d'info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Vous pourrez changer de menu à tout moment depuis le menu principal
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}