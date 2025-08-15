'use client';
import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X, Factory } from 'lucide-react';
import toast from 'react-hot-toast';
import { appEvents, EVENTS } from '@/lib/events';

interface Farm {
  _id?: string;
  name: string;
  slug: string;
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

export default function FarmsManager() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  const [newFarm, setNewFarm] = useState<Farm>({
    name: '',
    slug: '',
    menu: 'caligaz',
    order: 0,
    isActive: true
  });

  // Charger les données au montage UNIQUEMENT
  useEffect(() => {
    if (hasLoadedRef.current) return; // Éviter les doubles chargements
    hasLoadedRef.current = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('🔄 FarmsManager - Chargement initial...');
        
        // Charger les menus
        const menusRes = await fetch('/api/menus');
        if (menusRes.ok) {
          const menusData = await menusRes.json();
          setMenus(menusData);
        }

        // Charger TOUTES les farms
        const timestamp = Date.now();
        const farmsRes = await fetch(`/api/farms/all?t=${timestamp}`);
        
        if (farmsRes.ok) {
          const farmsData = await farmsRes.json();
          console.log('🏭 Farms reçues:', farmsData.length);
          setFarms(farmsData);
        } else {
          console.error('❌ Erreur chargement farms');
          setFarms([]);
        }
      } catch (error) {
        console.error('❌ Erreur:', error);
        setFarms([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // Une seule fois au montage

  // Fonction de rechargement manuel
  const reloadData = async () => {
    try {
      console.log('🔄 Rechargement manuel des farms...');
      
      const timestamp = Date.now();
      const farmsRes = await fetch(`/api/farms/all?t=${timestamp}`);
      
      if (farmsRes.ok) {
        const farmsData = await farmsRes.json();
        console.log('🏭 Farms rechargées:', farmsData.length);
        setFarms(farmsData);
      }
    } catch (error) {
      console.error('❌ Erreur rechargement:', error);
    }
  };

  // Écouter les changements de farms
  useEffect(() => {
    console.log('📊 Farms dans l\'état:', farms.length);
  }, [farms]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleCreate = async () => {
    if (!newFarm.name || !newFarm.menu) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const farmToSave = {
        name: newFarm.name,
        slug: generateSlug(newFarm.name),
        menu: newFarm.menu,
        order: newFarm.order || 0,
        isActive: true
      };

      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(farmToSave)
      });

      if (response.ok) {
        // Message de succès
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        successMsg.textContent = '✅ Farm ajoutée avec succès!';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
        
        // Réinitialiser le formulaire
        setNewFarm({ name: '', slug: '', menu: 'caligaz', order: 0, isActive: true });
        setIsCreating(false);
        
        // Recharger les données
        await reloadData();
        
        // Émettre l'événement
        appEvents.emit(EVENTS.FARMS_UPDATED);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur lors de la création de la farm');
    }
  };

  const handleUpdate = async () => {
    if (!editingFarm) return;

    try {
      const response = await fetch(`/api/farms/${editingFarm._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingFarm)
      });

      if (response.ok) {
        // Message de succès
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        successMsg.textContent = '✅ Farm modifiée avec succès!';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
        
        setEditingFarm(null);
        
        // Recharger les données
        await reloadData();
        
        // Émettre l'événement
        appEvents.emit(EVENTS.FARMS_UPDATED);
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur lors de la mise à jour de la farm');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette farm ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/farms/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Message de succès
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        successMsg.textContent = '✅ Farm supprimée avec succès!';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
        
        // Simplement recharger toutes les données
        await reloadData();
        
        // Émettre l'événement
        appEvents.emit(EVENTS.FARMS_UPDATED);
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Grouper les farms par menu
  const farmsByMenu = farms.reduce((acc, farm) => {
    const menuSlug = farm.menu || 'sans-menu';
    if (!acc[menuSlug]) {
      acc[menuSlug] = [];
    }
    acc[menuSlug].push(farm);
    return acc;
  }, {} as Record<string, Farm[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Factory className="w-6 h-6" />
            Gestion des Farms
          </h2>
          <p className="text-gray-400 mt-1">
            Gérez les farms par menu
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Farm
          </button>
        )}
      </div>

      {/* Formulaire de création */}
      {isCreating && (
        <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Créer une nouvelle farm</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom de la farm *
              </label>
              <input
                type="text"
                value={newFarm.name}
                onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2"
                placeholder="Ex: Total"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Menu *
              </label>
              <select
                value={newFarm.menu}
                onChange={(e) => setNewFarm({ ...newFarm, menu: e.target.value })}
                className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2"
              >
                {menus.map((menu) => (
                  <option key={menu.slug} value={menu.slug}>
                    {menu.emoji} {menu.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setIsCreating(false);
                setNewFarm({
                  name: '',
                  slug: '',
                  menu: 'caligaz',
                  order: 0,
                  isActive: true
                });
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Créer
            </button>
          </div>
        </div>
      )}

      {/* Liste des farms groupées par menu */}
      <div key={farms.length} className="space-y-6">
        {Object.entries(farmsByMenu).map(([menuSlug, menuFarms]) => {
          const menu = menus.find(m => m.slug === menuSlug);
          return (
            <div key={menuSlug} className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                {menu ? (
                  <>
                    <span>{menu.emoji}</span>
                    <span>{menu.name}</span>
                  </>
                ) : (
                  <span>Sans menu</span>
                )}
                <span className="text-sm text-gray-400">({menuFarms.length} farms)</span>
              </h3>
              
              <div className="space-y-2">
                {menuFarms.map((farm) => (
                  <div
                    key={farm._id}
                    className="bg-gray-800 rounded-lg p-4 border border-white/10"
                  >
                    {editingFarm?._id === farm._id ? (
                      // Mode édition
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Nom
                            </label>
                            <input
                              type="text"
                              value={editingFarm.name}
                              onChange={(e) => setEditingFarm({ ...editingFarm, name: e.target.value })}
                              className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Menu
                            </label>
                            <select
                              value={editingFarm.menu}
                              onChange={(e) => setEditingFarm({ ...editingFarm, menu: e.target.value })}
                              className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2"
                            >
                              {menus.map((menu) => (
                                <option key={menu.slug} value={menu.slug}>
                                  {menu.emoji} {menu.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingFarm(null)}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Annuler
                          </button>
                          <button
                            onClick={handleUpdate}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Sauvegarder
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Mode affichage
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-white">
                            {farm.name}
                          </h4>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-500">
                              Slug: <code className="bg-gray-700 px-2 py-1 rounded">{farm.slug}</code>
                            </span>
                            <span className={`text-sm ${farm.isActive ? 'text-green-400' : 'text-red-400'}`}>
                              {farm.isActive ? '● Actif' : '● Inactif'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingFarm(farm)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => farm._id && handleDelete(farm._id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {farms.length === 0 && (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-white/10">
            <Factory className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Aucune farm créée pour le moment</p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Créer la première farm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}