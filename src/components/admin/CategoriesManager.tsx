'use client';
import { useState, useEffect } from 'react';
import { Plus, RefreshCw, RotateCw } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Fonction pour forcer le rechargement complet
  const forceRefresh = async () => {
    setLoading(true);
    setCategories([]); // Vider d'abord
    
    // Attendre un peu pour forcer React à re-render
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Ajouter un timestamp unique pour bypasser TOUT cache
      const timestamp = Date.now();
      const random = Math.random();
      const response = await fetch(`/api/categories/all?t=${timestamp}&r=${random}&nocache=true`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${data.length} catégories chargées`);
        setCategories(data);
        setRefreshKey(prev => prev + 1); // Forcer re-render
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour recharger complètement la page
  const hardRefresh = () => {
    window.location.reload();
  };

  // Charger au montage
  useEffect(() => {
    forceRefresh();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        cache: 'no-store'
      });
      
      if (response.ok) {
        // Recharger immédiatement
        await forceRefresh();
        alert('✅ Catégorie supprimée avec succès!');
      }
    } catch (error) {
      console.error('Erreur:', error);
      forceRefresh();
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
        }),
        cache: 'no-store'
      });
      
      if (response.ok) {
        // Recharger immédiatement
        await forceRefresh();
        alert('✅ Catégorie créée avec succès!');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.details || error.error}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création');
    }
  };

  return (
    <div key={refreshKey} className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          Catégories ({categories.length})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={forceRefresh}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <button
            onClick={hardRefresh}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2"
            title="Recharger complètement la page"
          >
            <RotateCw className="w-4 h-4" />
            Recharger page
          </button>
          <button
            onClick={handleCreate}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center text-white py-8">
          ⏳ Chargement...
        </div>
      )}

      {!loading && categories.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          Aucune catégorie. Les catégories sont bien dans MongoDB mais ne s'affichent pas ? 
          <br />Cliquez sur "Recharger page" ci-dessus.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={`${category._id}-${refreshKey}`} className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-bold">{category.name}</h3>
            <p className="text-gray-400 text-sm">Menu: {category.menu}</p>
            <p className="text-gray-400 text-sm">Slug: {category.slug}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => category._id && handleDelete(category._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
        <h3 className="text-yellow-400 font-bold mb-2">🔍 Debug Info:</h3>
        <p className="text-yellow-300 text-sm">
          Si les catégories ne s'affichent pas mais sont dans MongoDB:
        </p>
        <ul className="text-yellow-200 text-sm mt-2 list-disc list-inside">
          <li>Cliquez sur "Rafraîchir" pour recharger les données</li>
          <li>Cliquez sur "Recharger page" pour un rechargement complet</li>
          <li>Vérifiez la console du navigateur (F12) pour les erreurs</li>
        </ul>
      </div>
    </div>
  );
}