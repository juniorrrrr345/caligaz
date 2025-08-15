'use client';
import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fixResult, setFixResult] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/check-database');
      const result = await res.json();
      setData(result);
    } catch (error) {
      setData({ error: 'Erreur de chargement' });
    } finally {
      setLoading(false);
    }
  };

  const fixDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fix-database');
      const result = await res.json();
      setFixResult(result);
      // Recharger les données après correction
      await loadData();
    } catch (error) {
      setFixResult({ error: 'Erreur de correction' });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="text-center">⏳ Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-4">🔍 Debug Panel</h1>

      {/* Boutons d'action */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={loadData}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          🔄 Actualiser
        </button>
        <button
          onClick={fixDatabase}
          className="bg-green-600 px-4 py-2 rounded"
        >
          🔧 Corriger la base
        </button>
      </div>

      {/* Résultat de correction */}
      {fixResult && (
        <div className={`mb-4 p-4 rounded ${fixResult.success ? 'bg-green-800' : 'bg-red-800'}`}>
          <h3 className="font-bold mb-2">Résultat de correction:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(fixResult, null, 2)}
          </pre>
        </div>
      )}

      {/* État de la base */}
      {data && (
        <div className="space-y-4">
          {/* Problèmes détectés */}
          {data.hasProblems && (
            <div className="bg-red-800 p-4 rounded">
              <h2 className="text-xl font-bold mb-2">⚠️ PROBLÈMES DÉTECTÉS</h2>
              <p>Des problèmes ont été trouvés dans la base de données.</p>
              <p>Cliquez sur "🔧 Corriger la base" pour les résoudre.</p>
            </div>
          )}

          {/* Catégories */}
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">📋 CATÉGORIES</h2>
            <div className="mb-2">
              <p>Total: {data.categories?.total || 0}</p>
              <p>CaliGaz: {data.categories?.byMenu?.caligaz || 0}</p>
              <p>Barcelona: {data.categories?.byMenu?.barcelona || 0}</p>
            </div>
            
            {/* Doublons */}
            {data.categories?.duplicates?.length > 0 && (
              <div className="bg-red-900 p-2 rounded mb-2">
                <p className="font-bold">Doublons trouvés:</p>
                {data.categories.duplicates.map((d: any, i: number) => (
                  <p key={i}>- {d.name} ({d.count} fois)</p>
                ))}
              </div>
            )}

            {/* Index */}
            <div className="mb-2">
              <p className="font-bold">Index:</p>
              {data.categories?.indexes?.map((idx: any, i: number) => (
                <p key={i} className="text-xs">
                  - {idx.name}: {JSON.stringify(idx.key)} {idx.unique && '(unique)'}
                </p>
              ))}
            </div>

            {/* Liste complète */}
            <details className="mt-2">
              <summary className="cursor-pointer font-bold">Voir toutes les catégories</summary>
              <div className="mt-2 space-y-1">
                {data.categories?.list?.map((cat: any) => (
                  <div key={cat.id} className="text-xs bg-gray-900 p-1 rounded">
                    {cat.name} - Menu: {cat.menu} - Active: {cat.isActive ? '✅' : '❌'}
                  </div>
                ))}
              </div>
            </details>
          </div>

          {/* Farms */}
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">🏭 FARMS</h2>
            <div className="mb-2">
              <p>Total: {data.farms?.total || 0}</p>
              <p>CaliGaz: {data.farms?.byMenu?.caligaz || 0}</p>
              <p>Barcelona: {data.farms?.byMenu?.barcelona || 0}</p>
            </div>
            
            {/* Doublons */}
            {data.farms?.duplicates?.length > 0 && (
              <div className="bg-red-900 p-2 rounded mb-2">
                <p className="font-bold">Doublons trouvés:</p>
                {data.farms.duplicates.map((d: any, i: number) => (
                  <p key={i}>- {d.name} ({d.count} fois)</p>
                ))}
              </div>
            )}

            {/* Index */}
            <div className="mb-2">
              <p className="font-bold">Index:</p>
              {data.farms?.indexes?.map((idx: any, i: number) => (
                <p key={i} className="text-xs">
                  - {idx.name}: {JSON.stringify(idx.key)} {idx.unique && '(unique)'}
                </p>
              ))}
            </div>

            {/* Liste complète */}
            <details className="mt-2">
              <summary className="cursor-pointer font-bold">Voir toutes les farms</summary>
              <div className="mt-2 space-y-1">
                {data.farms?.list?.map((farm: any) => (
                  <div key={farm.id} className="text-xs bg-gray-900 p-1 rounded">
                    {farm.name} - Menu: {farm.menu} - Active: {farm.isActive ? '✅' : '❌'}
                  </div>
                ))}
              </div>
            </details>
          </div>

          {/* Données brutes */}
          <details className="bg-gray-800 p-4 rounded">
            <summary className="cursor-pointer font-bold">📊 Données brutes JSON</summary>
            <pre className="mt-2 text-xs overflow-auto bg-black p-2 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}