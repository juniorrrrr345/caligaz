'use client';
import { useState, useEffect } from 'react';

interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  menu: string;
  order: number;
  isActive: boolean;
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    menu: 'caligaz',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les catégories
      const categoriesRes = await fetch('/api/categories/all');
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      // Charger les menus
      const menusRes = await fetch('/api/menus');
      if (menusRes.ok) {
        const menusData = await menusRes.json();
        setMenus(menusData);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData(category);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.menu) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const url = editingCategory 
        ? `/api/categories/${editingCategory._id}` 
        : '/api/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      // Générer le slug si nécessaire
      const dataToSave = {
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });

      if (response.ok) {
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
        await loadData();
      } else {
        const error = await response.json();
        alert(error.details || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      // D'abord supprimer visuellement
      setCategories(prev => prev.filter(c => c._id !== categoryId));
      
      // Ensuite supprimer dans la base de données
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Si erreur, recharger pour restaurer l'état correct
        console.error('Erreur lors de la suppression');
        await loadData();
      } else {
        // Si succès, recharger quand même après un délai pour synchroniser
        setTimeout(() => {
          loadData();
        }, 500);
      }
    } catch (error) {
      console.error('Erreur:', error);
      // En cas d'erreur, recharger
      await loadData();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">⏳ Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">
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
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          ➕ Nouvelle Catégorie
        </button>
      </div>

      {/* Liste des catégories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category._id} className="bg-gray-900/50 border border-white/20 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-bold">{category.name}</h3>
              <span className={`px-2 py-1 rounded text-xs ${
                category.isActive ? 'bg-green-600' : 'bg-red-600'
              }`}>
                {category.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
            
            <p className="text-gray-400 text-sm mb-2">Menu: {category.menu}</p>
            <p className="text-gray-500 text-xs mb-3">Slug: {category.slug}</p>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(category)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-sm"
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => category._id && handleDelete(category._id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-sm"
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          Aucune catégorie. Cliquez sur "Nouvelle Catégorie" pour en créer une.
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[99999]">
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
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2"
                  placeholder="Ex: Dry Sift"
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Menu *</label>
                <select
                  value={formData.menu || 'caligaz'}
                  onChange={(e) => setFormData({ ...formData, menu: e.target.value })}
                  className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2"
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
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Ordre</label>
                <input
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive !== false}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-white">Catégorie active</label>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/20 flex gap-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                💾 Sauvegarder
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