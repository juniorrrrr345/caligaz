'use client';
import { useState, useEffect } from 'react';
import ProductsManager from './ProductsManager';
import MenusManager from './MenusManager';
import SocialLinksManager from './SocialLinksManager';
import SettingsManager from './SettingsManager';
import PagesManager from './PagesManager';
import { appEvents, EVENTS } from '@/lib/events';


interface AdminDashboardProps {
  onLogout: () => void;
}

type SectionType = 'products' | 'menus' | 'settings' | 'socialLinks' | 'pages';

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<SectionType>('products');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fonction pour forcer le rechargement de tout le dashboard
  const forceFullRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Écouter les événements de mise à jour
  useEffect(() => {
    const handleUpdate = () => {
      console.log('🔄 Mise à jour détectée - Rechargement du dashboard');
      forceFullRefresh();
    };

    // S'abonner aux événements
    appEvents.on(EVENTS.CATEGORIES_UPDATED, handleUpdate);
    appEvents.on(EVENTS.FARMS_UPDATED, handleUpdate);
    appEvents.on(EVENTS.PRODUCTS_UPDATED, handleUpdate);

    return () => {
      appEvents.off(EVENTS.CATEGORIES_UPDATED, handleUpdate);
      appEvents.off(EVENTS.FARMS_UPDATED, handleUpdate);
      appEvents.off(EVENTS.PRODUCTS_UPDATED, handleUpdate);
    };
  }, []);

  const menuItems = [
    { id: 'products' as SectionType, label: 'Produits', icon: '🛍️' },
    { id: 'menus' as SectionType, label: 'Menus', icon: '📋' },
    { id: 'settings' as SectionType, label: 'Paramètres', icon: '⚙️' },
    { id: 'socialLinks' as SectionType, label: 'Réseaux sociaux', icon: '🔗' },
    { id: 'pages' as SectionType, label: 'Pages', icon: '📄' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'products':
        return <ProductsManager />;
      case 'menus':
        return <MenusManager />;
      case 'settings':
        return <SettingsManager />;
      case 'socialLinks':
        return <SocialLinksManager />;
      case 'pages':
        return <PagesManager />;
      default:
        return <ProductsManager />;
    }
  };

  return (
    <div key={refreshKey} className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Desktop: Sidebar + Content */}
      <div className="hidden lg:flex">
        {/* Sidebar Desktop avec style ÎLE DE FRANCE FULL OPTION */}
        <aside className="w-72 bg-gradient-to-b from-black via-gray-900 to-black border-r border-white/10 min-h-screen sticky top-0">
          <div className="p-6 border-b border-white/10">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 animate-pulse">
              ÎLE DE FRANCE
            </h1>
            <p className="text-xs text-white/60 mt-1 tracking-[0.3em] uppercase">Full Option Admin</p>
          </div>
          
          <nav className="p-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-6 py-4 rounded-xl mb-2 transition-all duration-300 transform hover:scale-105 ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                <span className="text-2xl mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                {activeSection === item.id && (
                  <span className="float-right text-lg">→</span>
                )}
              </button>
            ))}
          </nav>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
            <button
              onClick={onLogout}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🚪 Déconnexion
            </button>
          </div>
        </aside>

        {/* Content Desktop */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile: Burger Menu + Content */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-white/10 sticky top-0 z-50">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-600">
              ÎLE DE FRANCE
            </h1>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-md">
            <div className="p-4 pt-20">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-6 py-4 rounded-xl mb-2 transition-all ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white/10 text-white/70'
                  }`}
                >
                  <span className="text-2xl mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              
              <button
                onClick={onLogout}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 px-6 rounded-xl mt-6"
              >
                🚪 Déconnexion
              </button>
            </div>
          </div>
        )}

        {/* Mobile Content */}
        <main className="p-4">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}