'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Tag } from 'lucide-react';
import { appEvents, EVENTS } from '@/lib/events';

interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  menu: string;
  order: number;
  isActive: boolean;
}

interface Menu {
  _id: string;
  name: string;
  slug: string;
  emoji: string;
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Category>({
    name: '',
    slug: '',
    description: '',
    menu: 'caligaz',
    order: 0,
    isActive: true
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 CategoriesManager - Chargement des données...');
      
      // Charger TOUTES les catégories
      const categoriesRes = await fetch('/api/categories/all');
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        console.log('🏷️ Catégories chargées:', categoriesData.length);
        setCategories(categoriesData);
      } else {
        setCategories([]);
      }

      // Charger les menus
      const menusRes = await fetch('/api/menus');
      if (menusRes.ok) {
        const menusData = await menusRes.json();
        console.log('📋 Menus chargés:', menusData.length);
        setMenus(menusData);
      } else {
        setMenus([{ _id: '1', slug: 'caligaz', name: 'CaliGaz', emoji: '⛽' }]);
      }
      
      console.log('✅ Chargement terminé');
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      setCategories([]);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      menu: category.menu,
      order: category.order,
      isActive: category.isActive
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.menu) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSaving(true);
    
    try {
      const dataToSave = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name)
      };

      const url = editingCategory ? `/api/categories/${editingCategory._id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave)
      });

      if (response.ok) {
        // Message de succès
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        successMsg.textContent = editingCategory ? '✅ Catégorie modifiée!' : '✅ Catégorie créée!';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
        
        // Fermer le modal et recharger
        setShowModal(false);
        setEditingCategory(null);
        setFormData({
          name: '',
          slug: '',
          description: '',
          menu: 'caligaz',
          order: 0,
          isActive: true
        });
        
        // Recharger les données
        await loadData();
        
        // Émettre l'événement
        appEvents.emit(EVENTS.CATEGORIES_UPDATED);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message || 'Erreur lors de la sauvegarde'}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Mettre à jour l'état local immédiatement
        setCategories(prev => prev.filter(c => c._id !== categoryId));
        
        // Message de succès
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        successMsg.textContent = '✅ Catégorie supprimée!';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
        
        // Émettre l'événement
        appEvents.emit(EVENTS.CATEGORIES_UPDATED);
      } else {
        alert('Erreur lors de la suppression');
        // Recharger en cas d'erreur
        await loadData();
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
      await loadData();
    }
  };

  // Grouper les catégories par menu
  const categoriesByMenu = categories.reduce((acc, category) => {
    const menuKey = category.menu || 'autres';
    if (!acc[menuKey]) {
      acc[menuKey] = [];
    }
    acc[menuKey].push(category);
    return acc;
  }, {} as Record<string, Category[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">⏳ Chargement des catégories...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Tag className="w-8 h-8" />
          Gestion des Catégories
        </h2>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({
              name: '',
              slug: '',
              description: '',
              menu: 'caligaz',
              order: 0,
              isActive: true
            });
            setShowModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Catégorie
        </button>
      </div>

      {/* Liste des catégories groupées par menu */}
      <div className="space-y-6">
        {Object.entries(categoriesByMenu).map(([menuSlug, menuCategories]) => {
          const menu = menus.find(m => m.slug === menuSlug);
          return (
            <div key={menuSlug} className="bg-gray-900/50 rounded-xl p-4 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                {menu ? `${menu.emoji} ${menu.name}` : `📁 ${menuSlug}`}
                <span className="text-sm text-gray-400">({menuCategories.length} catégories)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuCategories.map((category) => (
                  <div key={category._id} className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-medium">{category.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${category.isActive ? 'bg-green-600' : 'bg-red-600'}`}>
                        {category.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    
                    {category.description && (
                      <p className="text-gray-400 text-sm mb-2">{category.description}</p>
                    )}
                    
                    <div className="text-xs text-gray-500 mb-3">
                      Slug: {category.slug} | Ordre: {category.order}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-sm"
                      >
                        <Edit2 className="w-4 h-4 inline mr-1" />
                        Modifier
                      </button>
                      <button
                        onClick={() => category._id && handleDelete(category._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-sm"
                      >
                        <Trash2 className="w-4 h-4 inline mr-1" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[99999]">
          <div className="bg-gray-900 border border-white/20 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-white/20">
              <h3 className="text-xl font-bold text-white">
                {editingCategory ? '✏️ Modifier la catégorie' : '➕ Nouvelle catégorie'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white mb-2">Nom *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-2"
                  placeholder="Ex: Dry Sift"
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Menu *</label>
                <select
                  value={formData.menu}
                  onChange={(e) => setFormData({ ...formData, menu: e.target.value })}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-2"
                >
                  {menus.map((menu) => (
                    <option key={menu.slug} value={menu.slug}>
                      {menu.emoji} {menu.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-2"
                  rows={3}
                  placeholder="Description optionnelle..."
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Ordre d'affichage</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-2"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-white">Catégorie active</label>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/20 flex gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex-1 ${isSaving ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-2 px-4 rounded-lg`}
              >
                {isSaving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCategory(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
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