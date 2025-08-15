'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuType } from '@/types';

interface MenuContextType {
  selectedMenu: MenuType | null;
  setSelectedMenu: (menu: MenuType) => void;
  clearSelectedMenu: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [selectedMenu, setSelectedMenuState] = useState<MenuType | null>(null);

  // Charger le menu depuis localStorage au démarrage
  useEffect(() => {
    const savedMenu = localStorage.getItem('selectedMenu') as MenuType;
    if (savedMenu && ['principal', 'barcelone'].includes(savedMenu)) {
      setSelectedMenuState(savedMenu);
    }
  }, []);

  const setSelectedMenu = (menu: MenuType) => {
    setSelectedMenuState(menu);
    localStorage.setItem('selectedMenu', menu);
  };

  const clearSelectedMenu = () => {
    setSelectedMenuState(null);
    localStorage.removeItem('selectedMenu');
  };

  return (
    <MenuContext.Provider value={{ selectedMenu, setSelectedMenu, clearSelectedMenu }}>
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