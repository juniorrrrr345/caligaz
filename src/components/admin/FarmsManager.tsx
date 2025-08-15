'use client';
import { useState, useEffect } from 'react';
import { MenuType, MenuConfig } from '@/types';

interface Farm {
  _id?: string;
  name: string;
  description?: string;
  country?: string;
  menu: MenuType;
  isActive?: boolean;
}

export default function FarmsManager() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [selectedMenuFilter, setSelectedMenuFilter] = useState<MenuType | 'all'>('all');
  const [availableMenus, setAvailableMenus] = useState<MenuConfig[]>([]);
  const [formData, setFormData] = useState<Partial<Farm>>({
    name: '',
    description: '',
    country: '',
    menu: 'principal'
  });

  useEffect(() => {
    loadMenus();
    loadFarms();
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

  const loadFarms = async () => {
    try {
      setLoading(true);
      console.log('🏭 Admin: Chargement des farms...');
      
      // Construire l'URL avec le filtre de menu si nécessaire
      let url = '/api/farms/all';
      if (selectedMenuFilter !== 'all') {
        url += `?menu=${selectedMenuFilter}`;
      }
      
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('🏭 Admin: Réponse farms:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('🏭 Admin: Farms chargées:', data.length);
        setFarms(data);
      } else {
        console.error('🏭 Admin: Erreur HTTP:', response.status);
      }
    } catch (error) {
      console.error('❌ Admin: Erreur lors du chargement des farms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Recharger quand le filtre de menu change
  useEffect(() => {
    loadFarms();
  }, [selectedMenuFilter]);

  const handleEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setFormData(farm);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingFarm(null);
    setFormData({
      name: '',
      description: '',
      country: '',
      menu: 'principal'
    });
    setShowModal(true);
  };

  const updateFormField = (field: keyof Farm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      console.log('💾 Admin: Sauvegarde farm...');
      const method = editingFarm ? 'PUT' : 'POST';
      const url = editingFarm ? `/api/farms/${editingFarm._id}` : '/api/farms';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('✅ Admin: Farm sauvegardée');
        setShowModal(false);
        await loadFarms(); // Recharger les données
      } else {
        console.error('❌ Admin: Erreur sauvegarde:', response.status);
      }
    } catch (error) {
      console.error('❌ Admin: Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('🗑️ Admin: Suppression farm...');
      const response = await fetch(`/api/farms/${id}`, {
        method: 'DELETE',
      });

      if (response.ok || response.status === 404) {
        console.log('✅ Admin: Farm supprimée');
        await loadFarms(); // Recharger les données
      } else {
        console.error('❌ Admin: Erreur suppression:', response.status);
      }
    } catch (error) {
      console.error('❌ Admin: Erreur lors de la suppression:', error);
    }
  };

  // Regrouper les farms par menu pour l'affichage
  const farmsByMenu = farms.reduce((acc, farm) => {
    const menu = farm.menu || 'principal';
    if (!acc[menu]) {
      acc[menu] = [];
    }
    acc[menu].push(farm);
    return acc;
  }, {} as Record<string, Farm[]>);

  const getMenuDisplayName = (menuType: MenuType) => {
    const menu = availableMenus.find(m => m.type === menuType);
    return menu ? menu.displayName : menuType;
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-gray-400">Chargement des farms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Gestion des Farms</h1>
          <p className="text-gray-400">({farms.length} au total)</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filtre par menu */}
          <select
            value={selectedMenuFilter}
            onChange={(e) => setSelectedMenuFilter(e.target.value as MenuType | 'all')}
            className="bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2"
          >
            <option value="all">Tous les menus</option>
            {availableMenus.map((menu) => (
              <option key={menu.type} value={menu.type}>
                {menu.displayName}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleAdd}
            className="bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 rounded-lg whitespace-nowrap"
          >
            ➕ Nouvelle Farm
          </button>
        </div>
      </div>

      {/* Affichage par menu */}
      {selectedMenuFilter === 'all' ? (
        // Vue groupée par menu
        <div className="space-y-8">
          {Object.entries(farmsByMenu).map(([menuType, menuFarms]) => (
            <div key={menuType}>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                {menuType === 'principal' ? '⛽' : '🇪🇸'} {getMenuDisplayName(menuType as MenuType)}
                <span className="text-sm text-gray-400">({menuFarms.length} farms)</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {menuFarms.map((farm) => (
                  <div key={farm._id} className="bg-gray-900 border border-white/20 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-white text-xl">{farm.name}</h3>
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {farm.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  
                    {farm.country && (
                      <p className="text-gray-400 text-sm mb-2">📍 {farm.country}</p>
                    )}
                    
                    {farm.description && (
                      <p className="text-gray-400 text-sm mb-4">{farm.description}</p>
                    )}
                  
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(farm)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(farm._id!)}
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
      ) : (
        // Vue filtrée
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {farms.map((farm) => (
              <div key={farm._id} className="bg-gray-900 border border-white/20 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-white text-xl">{farm.name}</h3>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                    {farm.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              
                {farm.country && (
                  <p className="text-gray-400 text-sm mb-2">📍 {farm.country}</p>
                )}
                
                {farm.description && (
                  <p className="text-gray-400 text-sm mb-4">{farm.description}</p>
                )}
              
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(farm)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(farm._id!)}
                    className="bg-red-600 hover:bg-red-500 text-white py-2 px-3 rounded text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingFarm ? 'Modifier la farm' : 'Ajouter une farm'}
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateFormField('name', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2"
                  placeholder="Ex: CaliGaz"
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pays</label>
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => updateFormField('country', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2"
                  placeholder="Ex: France"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateFormField('description', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 h-20"
                  placeholder="Description de la farm..."
                />
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