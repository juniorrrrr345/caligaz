'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Menu as MenuIcon, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { appEvents, EVENTS } from '@/lib/events';

interface Menu {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  emoji: string;
  isActive: boolean;
  order: number;
}

export default function MenusManager() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newMenu, setNewMenu] = useState<Menu>({
    name: '',
    slug: '',
    description: '',
    emoji: '',
    isActive: true,
    order: 0
  });

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/menus');
      if (response.ok) {
        const data = await response.json();
        setMenus(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des menus:', error);
      toast.error('Erreur lors du chargement des menus');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newMenu.name || !newMenu.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      console.log('Token pour création menu:', token ? 'Présent' : 'Absent');
      
      const response = await fetch('/api/menus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMenu)
      });

      if (response.ok) {
        const menu = await response.json();
        setMenus([...menus, menu]);
        setNewMenu({
          name: '',
          slug: '',
          description: '',
          emoji: '',
          isActive: true,
          order: menus.length
        });
        setIsCreating(false);
        toast.success('Menu créé avec succès');
        // Émettre l'événement pour rafraîchir les menus côté client
        appEvents.emit(EVENTS.MENUS_UPDATED);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création du menu');
    }
  };

  const handleUpdate = async () => {
    if (!editingMenu || !editingMenu.name || !editingMenu.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      console.log('Token pour mise à jour menu:', token ? 'Présent' : 'Absent');
      console.log('Données à envoyer:', {
        id: editingMenu._id,
        name: editingMenu.name,
        description: editingMenu.description,
        emoji: editingMenu.emoji
      });
      
      const response = await fetch('/api/menus', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editingMenu._id,
          name: editingMenu.name,
          description: editingMenu.description,
          emoji: editingMenu.emoji,
          slug: editingMenu.slug,
          isActive: editingMenu.isActive,
          order: editingMenu.order
        })
      });

      if (response.ok) {
        const updatedMenu = await response.json();
        setMenus(menus.map(m => m._id === updatedMenu._id ? updatedMenu : m));
        setEditingMenu(null);
        toast.success('Menu mis à jour avec succès');
        // Émettre l'événement pour rafraîchir les menus côté client
        appEvents.emit(EVENTS.MENUS_UPDATED);
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce menu ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/menus?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setMenus(menus.filter(m => m._id !== id));
        toast.success('Menu supprimé avec succès');
        // Émettre l'événement pour rafraîchir les menus côté client
        appEvents.emit(EVENTS.MENUS_UPDATED);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

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
            <MenuIcon className="w-6 h-6" />
            Gestion des Menus
          </h2>
          <p className="text-gray-400 mt-1">
            Gérez les différents menus de votre boutique
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouveau Menu
          </button>
        )}
      </div>

      {/* Formulaire de création */}
      {isCreating && (
        <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Créer un nouveau menu</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom du menu *
              </label>
              <input
                type="text"
                value={newMenu.name}
                onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
                className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2"
                placeholder="Ex: CaliGaz Barcelone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Emoji (optionnel)
              </label>
              <input
                type="text"
                value={newMenu.emoji}
                onChange={(e) => setNewMenu({ ...newMenu, emoji: e.target.value })}
                className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2"
                placeholder="Ex: 🇪🇸"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={newMenu.description}
                onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
                className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2"
                rows={3}
                placeholder="Description du menu..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setIsCreating(false);
                setNewMenu({
                  name: '',
                  slug: '',
                  description: '',
                  emoji: '',
                  isActive: true,
                  order: 0
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

      {/* Liste des menus */}
      <div className="space-y-4">
        {menus.map((menu) => (
          <div
            key={menu._id}
            className="bg-gray-800 rounded-lg p-6 border border-white/10"
          >
            {editingMenu?._id === menu._id ? (
              // Mode édition
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom du menu
                    </label>
                    <input
                      type="text"
                      value={editingMenu.name}
                      onChange={(e) => setEditingMenu({ ...editingMenu, name: e.target.value })}
                      className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={editingMenu.emoji}
                      onChange={(e) => setEditingMenu({ ...editingMenu, emoji: e.target.value })}
                      className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editingMenu.description}
                      onChange={(e) => setEditingMenu({ ...editingMenu, description: e.target.value })}
                      className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingMenu(null)}
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
                <div className="flex items-start gap-4">
                  <div className="flex items-center text-gray-400">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      {menu.emoji && <span>{menu.emoji}</span>}
                      {menu.name}
                      {menu.slug === 'caligaz' && (
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                          Principal
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-400 mt-1">{menu.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-500">
                        Slug: <code className="bg-gray-700 px-2 py-1 rounded">{menu.slug}</code>
                      </span>
                      <span className={`text-sm ${menu.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {menu.isActive ? '● Actif' : '● Inactif'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingMenu(menu)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {menu.slug !== 'caligaz' && (
                    <button
                      onClick={() => menu._id && handleDelete(menu._id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {menus.length === 0 && (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-white/10">
            <MenuIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Aucun menu créé pour le moment</p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Créer le premier menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}