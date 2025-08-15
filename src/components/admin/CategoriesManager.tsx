'use client';
import { useState, useEffect } from 'react';
import { MenuType, MenuConfig } from '@/types';

interface Category {
  _id?: string;
  name: string;
  description?: string;
  emoji?: string;
  menu: MenuType;
  isActive?: boolean;
  order?: number;
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [availableMenus, setAvailableMenus] = useState<MenuConfig[]>([]);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    menu: 'principal'
  });

  useEffect(() => {
    loadMenus();
    loadCategories();
  }, []);

  const loadMenus = async () => {
    try {
      const response = await fetch('/api/menus');
      if (response.ok) {
        const menus = await response.json();
        setAvailableMenus(menus);
      }
    } catch (error) {
      console.error('Erreur chargement menus:', error);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log('🏷️ Admin: Chargement des catégories...');
      
      const response = await fetch('/api/categories/all', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('🏷️ Admin: Réponse catégories:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('🏷️ Admin: Catégories chargées:', data.length);
        setCategories(data);
      } else {
        console.error('🏷️ Admin: Erreur HTTP:', response.status);
      }
    } catch (error) {
      console.error('❌ Admin: Erreur lors du chargement des catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData(category);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      menu: 'principal'
    });
    setShowModal(true);
  };

  const updateFormField = (field: keyof Category, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      console.log('💾 Admin: Sauvegarde catégorie...');
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory ? `/api/categories/${editingCategory._id}` : '/api/categories';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('✅ Admin: Catégorie sauvegardée');
        setShowModal(false);
        await loadCategories(); // Recharger les données
      } else {
        console.error('❌ Admin: Erreur sauvegarde:', response.status);
      }
    } catch (error) {
      console.error('❌ Admin: Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('🗑️ Admin: Suppression catégorie...');
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok || response.status === 404) {
        console.log('✅ Admin: Catégorie supprimée');
        await loadCategories(); // Recharger les données
      } else {
        console.error('❌ Admin: Erreur suppression:', response.status);
      }
    } catch (error) {
      console.error('❌ Admin: Erreur lors de la suppression:', error);
    }
  };

  // Regrouper les catégories par menu pour l'affichage
  const categoriesByMenu = categories.reduce((acc, category) => {
    const menu = category.menu || 'principal';
    if (!acc[menu]) {
      acc[menu] = [];
    }
    acc[menu].push(category);
    return acc;
  }, {} as Record<string, Category[]>);

  const getMenuDisplayName = (menuType: MenuType) => {
    const menu = availableMenus.find(m => m.type === menuType);
    return menu ? menu.displayName : menuType;
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-gray-400">Chargement des catégories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Gestion des Catégories</h1>
          <p className="text-gray-400">({categories.length} au total)</p>
        </div>
        
        <button
          onClick={handleAdd}
          className="bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 rounded-lg whitespace-nowrap"
        >
          ➕ Nouvelle Catégorie
        </button>
      </div>

      {/* Affichage groupé par menu */}
      <div className="space-y-8">
        {Object.entries(categoriesByMenu).map(([menuType, menuCategories]) => (
          <div key={menuType}>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              {menuType === 'principal' ? '⛽' : '🇪🇸'} {getMenuDisplayName(menuType as MenuType)}
              <span className="text-sm text-gray-400">({menuCategories.length} catégories)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {menuCategories.map((category) => (
                <div key={category._id} className="bg-gray-900 border border-white/20 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-white text-xl">{category.name}</h3>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                      {category.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm"
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(category._id!)}
                      className="bg-red-600 hover:bg-red-500 text-white py-2 px-3 rounded text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateFormField('name', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2"
                  placeholder="Ex: 120U ++ 🇲🇦"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Menu</label>
                <select
                  value={formData.menu || 'principal'}
                  onChange={(e) => updateFormField('menu', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2"
                >
                  {availableMenus.map((menu) => (
                    <option key={menu.type} value={menu.type}>
                      {menu.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleSave}
                className="bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 rounded-lg flex-1"
              >
                💾 Sauvegarder
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                ❌ Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}