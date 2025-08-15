'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Factory } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [formData, setFormData] = useState<Farm>({
    name: '',
    slug: '',
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
      console.log('🔄 FarmsManager - Chargement des données...');
      
      // Charger TOUTES les farms
      const farmsRes = await fetch('/api/farms/all');
      if (farmsRes.ok) {
        const farmsData = await farmsRes.json();
        console.log('🏭 Farms chargées:', farmsData.length);
        setFarms(farmsData);
      } else {
        setFarms([]);
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
      setFarms([]);
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

  const handleEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setFormData({
      name: farm.name,
      slug: farm.slug,
      menu: farm.menu,
      order: farm.order,
      isActive: farm.isActive
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

      const url = editingFarm ? `/api/farms/${editingFarm._id}` : '/api/farms';
      const method = editingFarm ? 'PUT' : 'POST';
      
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
        successMsg.textContent = editingFarm ? '✅ Farm modifiée!' : '✅ Farm créée!';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
        
        // Fermer le modal et recharger
        setShowModal(false);
        setEditingFarm(null);
        setFormData({
          name: '',
          slug: '',
          menu: 'caligaz',
          order: 0,
          isActive: true
        });
        
        // Recharger les données
        await loadData();
        
        // Émettre l'événement
        appEvents.emit(EVENTS.FARMS_UPDATED);
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

  const handleDelete = async (farmId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette farm ?')) return;

    try {
      const response = await fetch(`/api/farms/${farmId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Mettre à jour l'état local immédiatement
        setFarms(prev => prev.filter(f => f._id !== farmId));
        
        // Message de succès
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        successMsg.textContent = '✅ Farm supprimée!';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
        
        // Émettre l'événement
        appEvents.emit(EVENTS.FARMS_UPDATED);
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

  // Grouper les farms par menu
  const farmsByMenu = farms.reduce((acc, farm) => {
    const menuKey = farm.menu || 'autres';
    if (!acc[menuKey]) {
      acc[menuKey] = [];
    }
    acc[menuKey].push(farm);
    return acc;
  }, {} as Record<string, Farm[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">⏳ Chargement des farms...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Factory className="w-8 h-8" />
          Gestion des Farms
        </h2>
        <button
          onClick={() => {
            setEditingFarm(null);
            setFormData({
              name: '',
              slug: '',
              menu: 'caligaz',
              order: 0,
              isActive: true
            });
            setShowModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Farm
        </button>
      </div>

      {/* Liste des farms groupées par menu */}
      <div className="space-y-6">
        {Object.entries(farmsByMenu).map(([menuSlug, menuFarms]) => {
          const menu = menus.find(m => m.slug === menuSlug);
          return (
            <div key={menuSlug} className="bg-gray-900/50 rounded-xl p-4 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                {menu ? `${menu.emoji} ${menu.name}` : `📁 ${menuSlug}`}
                <span className="text-sm text-gray-400">({menuFarms.length} farms)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuFarms.map((farm) => (
                  <div key={farm._id} className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-medium">{farm.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${farm.isActive ? 'bg-green-600' : 'bg-red-600'}`}>
                        {farm.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-3">
                      Slug: {farm.slug} | Ordre: {farm.order}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(farm)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-sm"
                      >
                        <Edit2 className="w-4 h-4 inline mr-1" />
                        Modifier
                      </button>
                      <button
                        onClick={() => farm._id && handleDelete(farm._id)}
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
                {editingFarm ? '✏️ Modifier la farm' : '➕ Nouvelle farm'}
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
                  placeholder="Ex: Gas Fruit"
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
                <label htmlFor="isActive" className="text-white">Farm active</label>
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
                  setEditingFarm(null);
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