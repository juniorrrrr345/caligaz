'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { appEvents, EVENTS } from '@/lib/events';

interface Menu {
  _id: string;
  name: string;
  slug: string;
  description: string;
  emoji: string;
  isActive: boolean;
  order: number;
}

interface MenuContextType {
  menus: Menu[];
  selectedMenu: Menu | null;
  selectMenu: (menu: Menu) => void;
  loading: boolean;
  refreshMenus: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenus();
    
    // Écouter les événements de mise à jour des menus
    const handleMenusUpdate = () => {
      console.log('📋 Événement MENUS_UPDATED reçu, rechargement...');
      fetchMenus();
    };
    
    appEvents.on(EVENTS.MENUS_UPDATED, handleMenusUpdate);
    
    return () => {
      appEvents.off(EVENTS.MENUS_UPDATED, handleMenusUpdate);
    };
  }, []);

  useEffect(() => {
    // Ne PAS restaurer automatiquement le menu - forcer la sélection à chaque visite
    // Cette logique est commentée pour toujours afficher le sélecteur
    /*
    const savedMenuSlug = localStorage.getItem('selectedMenuSlug');
    if (savedMenuSlug && menus.length > 0) {
      const menu = menus.find(m => m.slug === savedMenuSlug);
      if (menu) {
        setSelectedMenu(menu);
      }
    }
    */
  }, [menus]);

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/menus');
      if (response.ok) {
        const data = await response.json();
        setMenus(data);
        
        // Ne PAS sélectionner automatiquement un menu
        // L'utilisateur doit choisir à chaque fois
      }
    } catch (error) {
      console.error('Erreur lors du chargement des menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectMenu = (menu: Menu) => {
    setSelectedMenu(menu);
    localStorage.setItem('selectedMenuSlug', menu.slug);
  };

  const refreshMenus = async () => {
    await fetchMenus();
  };

  return (
    <MenuContext.Provider value={{ menus, selectedMenu, selectMenu, loading, refreshMenus }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}