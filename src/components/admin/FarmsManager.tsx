'use client';
import { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';

interface Farm {
  _id?: string;
  name: string;
  slug: string;
  menu: string;
  order: number;
  isActive: boolean;
}

export default function FarmsManager() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Fonction pour forcer le rechargement complet
  const forceRefresh = async () => {
    setLoading(true);
    setFarms([]); // Vider d'abord
    
    // Attendre un peu pour forcer React à re-render
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Ajouter un timestamp unique pour bypasser TOUT cache
      const timestamp = Date.now();
      const random = Math.random();
      const response = await fetch(`/api/farms/all?t=${timestamp}&r=${random}&nocache=true`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${data.length} farms chargées`);
        setFarms(data);
        setRefreshKey(prev => prev + 1); // Forcer re-render
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage
  useEffect(() => {
    forceRefresh();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette farm ?')) return;
    
    try {
      const response = await fetch(`/api/farms/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Supprimer immédiatement de l'interface
        setFarms(prev => prev.filter(f => f._id !== id));
        
        // Puis recharger depuis la DB après 1 seconde
        setTimeout(() => forceRefresh(), 1000);
      }
    } catch (error) {
      console.error('Erreur:', error);
      forceRefresh();
    }
  };

  const handleCreate = async () => {
    const name = prompt('Nom de la farm:');
    if (!name) return;
    
    const menu = prompt('Menu (caligaz ou caligaz-barcelone):', 'caligaz');
    if (!menu) return;
    
    try {
      const response = await fetch('/api/farms', {
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
        // Recharger immédiatement
        await forceRefresh();
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
          Farms ({farms.length})
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

      {!loading && farms.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          Aucune farm
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {farms.map((farm) => (
          <div key={`${farm._id}-${refreshKey}`} className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-bold">{farm.name}</h3>
            <p className="text-gray-400 text-sm">Menu: {farm.menu}</p>
            <p className="text-gray-400 text-sm">Slug: {farm.slug}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => farm._id && handleDelete(farm._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}