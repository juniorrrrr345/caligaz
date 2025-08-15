export type MenuType = 'principal' | 'barcelone';

export interface Category {
  _id: string;
  name: string;
  emoji: string;
  menu: MenuType;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

export interface Farm {
  _id: string;
  name: string;
  description: string;
  country: string;
  menu: MenuType;
  isActive: boolean;
  createdAt: Date;
}

export interface Product {
  _id: string;
  name: string;
  farm: string;
  category: string;
  image: string;
  video?: string;
  prices: {
    '5g': number;
    '10g': number;
    '25g': number;
    '50g': number;
    '100g': number;
    '200g': number;
  };
  promotions: {
    '5g': number;
    '10g': number;
    '25g': number;
    '50g': number;
    '100g': number;
    '200g': number;
  };
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuConfig {
  type: MenuType;
  name: string;
  displayName: string;
}