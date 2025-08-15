'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';

interface Category {
  _id?: string;
  name: string;
  slug: string;
  menu: string;
  order: number;
  isActive: boolean;
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories/all?t=' + Date.now());
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Supprimer immédiatement de l'interface
        setCategories(prev => prev.filter(c => c._id !== id));
      } else {
        // Si erreur, recharger
        await loadCategories();
      }
    } catch (error) {
      console.error('Erreur:', error);
      await loadCategories();
    }
  };

  const handleCreate = async () => {
    const name = prompt('Nom de la catégorie:');
    if (!name) return;
    
    const menu = prompt('Menu (caligaz ou caligaz-barcelone):', 'caligaz');
    if (!menu) return;
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          menu,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          order: 0,
          isActive: true
        })
      });
      
      if (response.ok) {
        await loadCategories();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.details || error.error}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
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
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Tag className="w-6 h-6" />
          Catégories
        </h2>
        <button
          onClick={handleCreate}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category._id} className="bg-gray-800 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-white font-bold">{category.name}</h3>
                <p className="text-gray-400 text-sm mt-1">Menu: {category.menu}</p>
                <p className="text-gray-500 text-xs mt-1">Slug: {category.slug}</p>
              </div>
              <button
                onClick={() => category._id && handleDelete(category._id)}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg ml-2"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          Aucune catégorie
        </div>
      )}
    </div>
  );
}