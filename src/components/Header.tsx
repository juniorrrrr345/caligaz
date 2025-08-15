'use client';
import { useState, useEffect } from 'react';
import contentCache from '@/lib/contentCache';
import { useCartStore } from '@/lib/cartStore';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { MenuType } from '@/types';

interface Settings {
  shopTitle: string;
  shopSubtitle: string;
  bannerText: string;
  titleEffect: string;
  scrollingText: string;
}

interface HeaderProps {
  selectedMenu?: MenuType;
  onBackToMenuSelection?: () => void;
}

export default function Header({ selectedMenu, onBackToMenuSelection }: HeaderProps) {
  const { getTotalItems, setIsOpen } = useCartStore();
  const totalItems = getTotalItems();
  
  // Forcer les données du cache instantané - JAMAIS d'ancien contenu
  // Header instantané depuis localStorage
  const [settings, setSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('adminSettings');
        if (cached) {
          const data = JSON.parse(cached);
          return {
            shopTitle: data.shopTitle || '',
            shopSubtitle: data.shopSubtitle || '',
            scrollingText: data.scrollingText || '',
            bannerText: data.bannerText || '',
            titleStyle: data.titleStyle || 'glow'
          };
        }
      } catch (e) {}
    }
    return {
      shopTitle: '',
      shopSubtitle: '',
      scrollingText: '',
      bannerText: '',
      titleStyle: 'glow'
    };
  });

  useEffect(() => {
    // Mise à jour en arrière-plan (pas prioritaire)
    setTimeout(() => {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          setSettings({
            shopTitle: data.shopTitle || '',
            shopSubtitle: data.shopSubtitle || '',
            scrollingText: data.scrollingText || '',
            bannerText: data.bannerText || '',
            titleStyle: data.titleStyle || 'glow'
          });
          
          // Mettre à jour le cache
          localStorage.setItem('adminSettings', JSON.stringify(data));
        })
        .catch(() => {});
    }, 100);
  }, []);

  const getMenuDisplayInfo = () => {
    if (selectedMenu === 'barcelone') {
      return {
        icon: '🇪🇸',
        title: 'Barcelone',
        subtitle: 'Sélection Espagnole'
      };
    }
    return {
      icon: '⛽',
      title: 'CaliGaz',
      subtitle: 'Menu Principal'
    };
  };

  const menuInfo = getMenuDisplayInfo();

  return (
    <header className="bg-black/90 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
      <div className="px-4 py-3">
        {/* Header principal */}
        <div className="flex items-center justify-between">
          {/* Zone gauche : Menu sélectionné */}
          <div className="flex items-center gap-3">
            {onBackToMenuSelection && (
              <button
                onClick={onBackToMenuSelection}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Changer de menu"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-2xl">{menuInfo.icon}</span>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">
                  {menuInfo.title}
                </h1>
                <p className="text-gray-400 text-xs">
                  {menuInfo.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Zone droite : Panier */}
          <button 
            onClick={() => setIsOpen(true)}
            className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-white" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Titre de la boutique si défini */}
        {settings.shopTitle && (
          <div className="mt-3 text-center">
            <h2 className={`text-white font-bold text-xl ${
              settings.titleStyle === 'glow' ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' :
              settings.titleStyle === 'neon' ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]' :
              settings.titleStyle === 'rainbow' ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent' :
              ''
            }`}>
              {settings.shopTitle}
            </h2>
            {settings.shopSubtitle && (
              <p className="text-gray-300 text-sm mt-1">
                {settings.shopSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Texte de bannière défilant */}
        {settings.bannerText && (
          <div className="mt-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden">
            <div className="whitespace-nowrap animate-scroll">
              <span className="inline-block py-2 px-4 text-white font-medium">
                {settings.bannerText}
              </span>
            </div>
          </div>
        )}

        {/* Texte défilant */}
        {settings.scrollingText && (
          <div className="mt-2 overflow-hidden">
            <div className="whitespace-nowrap animate-scroll">
              <span className="inline-block py-1 text-gray-300 text-sm">
                {settings.scrollingText}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}