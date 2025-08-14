'use client';
import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const timestamp = Date.now();
      const response = await fetch(`/api/check-db?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="p-8 text-white">Chargement...</div>;

  return (
    <div className="p-8 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">🔍 Debug MongoDB</h1>
      
      <button 
        onClick={loadData}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded mb-4"
      >
        🔄 Recharger
      </button>

      <div className="space-y-4">
        <div className="bg-gray-900 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">📊 Statistiques</h2>
          <pre className="text-sm">{JSON.stringify(data?.stats, null, 2)}</pre>
        </div>

        <div className="bg-gray-900 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">📋 Menus</h2>
          <pre className="text-sm">{JSON.stringify(data?.menus, null, 2)}</pre>
        </div>

        <div className="bg-gray-900 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">🏷️ Catégories par menu</h2>
          <pre className="text-sm">{JSON.stringify(data?.categoriesByMenu, null, 2)}</pre>
        </div>

        <div className="bg-gray-900 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">🏭 Farms par menu</h2>
          <pre className="text-sm">{JSON.stringify(data?.farmsByMenu, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}