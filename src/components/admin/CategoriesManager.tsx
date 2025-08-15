'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { appEvents, EVENTS } from '@/lib/events';

interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
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

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Pour forcer le re-render

  const [newCategory, setNewCategory] = useState<Category>({
    name: '',
    slug: '',
    menu: 'caligaz',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true); // Forcer le re-render
    setCategories([]); // Vider les catégories pour forcer React à voir le changement
    try {
      console.log('🔄 Chargement des données...');
      
      // Charger les menus
      const menusRes = await fetch('/api/menus', { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (menusRes.ok) {
        const menusData = await menusRes.json();
        setMenus(menusData);
        console.log('📋 Menus chargés:', menusData.length);
      }

      // Charger TOUTES les catégories (sans filtre par menu)
      // Ajouter un timestamp pour forcer le rechargement
      const categoriesRes = await fetch(`/api/categories/all?t=${Date.now()}`, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        console.log('🏷️ Catégories chargées:', categoriesData.length);
        categoriesData.forEach((cat: any) => {
          console.log(`  - ${cat.name} (Menu: ${cat.menu}, ID: ${cat._id})`);
        });
        // Forcer React à voir un nouvel array
        setCategories([...categoriesData]);
        setRefreshKey(Date.now()); // Utiliser timestamp comme clé unique
      } else {
        console.error('❌ Erreur chargement catégories:', categoriesRes.status);
        setCategories([]);
        setRefreshKey(Date.now());
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
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

  const handleCreate = async () => {
    if (!newCategory.name || !newCategory.menu) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const categoryToSave = {
        name: newCategory.name,
        slug: generateSlug(newCategory.name),
        menu: newCategory.menu,
        description: newCategory.description || '',
        order: newCategory.order || 0,
        isActive: true
      };

      console.log('📝 Création catégorie pour menu:', categoryToSave.menu);

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryToSave)
      });

      if (response.ok) {
        const category = await response.json();
        console.log('✅ Catégorie créée:', category);
        
        // Afficher un message de succès
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        successMsg.textContent = '✅ Catégorie ajoutée avec succès!';
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
          successMsg.remove();
        }, 3000);
        
        // Réinitialiser le formulaire
        setNewCategory({ name: '', slug: '', description: '', menu: 'caligaz', order: 0, isActive: true });
        setIsCreating(false);
        
        // Recharger les données comme dans ProductsManager
        await fetchData();
        
        // Émettre l'événement pour synchroniser avec les autres composants
        appEvents.emit(EVENTS.CATEGORIES_UPDATED);
      } else {
        const error = await response.json();
        console.error('❌ Erreur de création:', error);
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        errorMsg.textContent = `❌ Erreur: ${error.error || 'Impossible de créer la catégorie'}`;
        document.body.appendChild(errorMsg);
        
        setTimeout(() => {
          errorMsg.remove();
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
      errorMsg.textContent = '❌ Erreur lors de la création de la catégorie';
      document.body.appendChild(errorMsg);
      
      setTimeout(() => {
        errorMsg.remove();
      }, 3000);
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;

    try {
      const response = await fetch(`/api/categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingCategory)
      });

      if (response.ok) {
        const updatedCategory = await response.json();
        console.log('✅ Catégorie mise à jour:', updatedCategory);
        
        // Afficher un message de succès
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        successMsg.textContent = '✅ Catégorie modifiée avec succès!';
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
          successMsg.remove();
        }, 3000);
        
        setEditingCategory(null);
        
        // Recharger les données comme dans ProductsManager
        await fetchData();
        
        // Émettre l'événement pour synchroniser avec les autres composants
        appEvents.emit(EVENTS.CATEGORIES_UPDATED);
      } else {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        errorMsg.textContent = '❌ Erreur lors de la mise à jour';
        document.body.appendChild(errorMsg);
        
        setTimeout(() => {
          errorMsg.remove();
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
      errorMsg.textContent = '❌ Erreur lors de la mise à jour de la catégorie';
      document.body.appendChild(errorMsg);
      
      setTimeout(() => {
        errorMsg.remove();
      }, 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    console.log('🗑️ Suppression de la catégorie:', id);

    try {
      // Afficher un loader pendant la suppression
      const loadingMsg = document.createElement('div');
      loadingMsg.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
      loadingMsg.textContent = '⏳ Suppression en cours...';
      document.body.appendChild(loadingMsg);

      // Envoyer la requête de suppression AVANT de mettre à jour l'interface
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });

      // Supprimer le message de chargement
      loadingMsg.remove();

      if (response.ok) {
        // Suppression réussie - mettre à jour l'interface IMMÉDIATEMENT
        setCategories(prev => prev.filter(cat => cat._id !== id));
        
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        successMsg.textContent = '✅ Catégorie supprimée avec succès!';
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
          successMsg.remove();
        }, 3000);
        
        // Émettre l'événement pour synchroniser avec les autres composants
        appEvents.emit(EVENTS.CATEGORIES_UPDATED);
      } else {
        const result = await response.json();
        console.error('❌ Erreur:', result);
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        errorMsg.textContent = `❌ Erreur: ${result.error || 'Impossible de supprimer'}`;
        document.body.appendChild(errorMsg);
        
        setTimeout(() => {
          errorMsg.remove();
        }, 3000);
        
        // Recharger les données en cas d'erreur
        await fetchData();
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
      errorMsg.textContent = '❌ Erreur de connexion';
      document.body.appendChild(errorMsg);
      
      setTimeout(() => {
        errorMsg.remove();
      }, 3000);
    }
  };

  // Grouper les catégories par menu
  const categoriesByMenu = categories.reduce((acc, category) => {
    const menuSlug = category.menu || 'sans-menu';
    if (!acc[menuSlug]) {
      acc[menuSlug] = [];
    }
    acc[menuSlug].push(category);
    return acc;
  }, {} as Record<string, Category[]>);

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
            <Tag className="w-6 h-6" />
            Gestion des Catégories
          </h2>
          <p className="text-gray-400 mt-1">
            Gérez les catégories de produits par menu
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Catégorie
          </button>
        )}
      </div>

      {/* Formulaire de création */}
      {isCreating && (
        <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Créer une nouvelle catégorie</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom de la catégorie *
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2"
                placeholder="Ex: Carburants"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Menu *
              </label>
              <select
                value={newCategory.menu}
                onChange={(e) => setNewCategory({ ...newCategory, menu: e.target.value })}
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
                setNewCategory({
                  name: '',
                  slug: '',
                  description: '',
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

      {/* Liste des catégories groupées par menu */}
      <div className="space-y-6" key={refreshKey}>
        {Object.entries(categoriesByMenu).map(([menuSlug, menuCategories]) => {
          const menu = menus.find(m => m.slug === menuSlug);
          return (
            <div key={`${menuSlug}-${refreshKey}`} className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                {menu ? (
                  <>
                    <span>{menu.emoji}</span>
                    <span>{menu.name}</span>
                  </>
                ) : (
                  <span>Sans menu</span>
                )}
                <span className="text-sm text-gray-400">({menuCategories.length} catégories)</span>
              </h3>
              
              <div className="space-y-2">
                {menuCategories.map((category) => (
                  <div
                    key={category._id}
                    className="bg-gray-800 rounded-lg p-4 border border-white/10"
                  >
                    {editingCategory?._id === category._id ? (
                      // Mode édition
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Nom
                            </label>
                            <input
                              type="text"
                              value={editingCategory.name}
                              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                              className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Menu
                            </label>
                            <select
                              value={editingCategory.menu}
                              onChange={(e) => setEditingCategory({ ...editingCategory, menu: e.target.value })}
                              className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2"
                            >
                              {menus.map((menu) => (
                                <option key={menu.slug} value={menu.slug}>
                                  {menu.emoji} {menu.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Description
                            </label>
                            <textarea
                              value={editingCategory.description}
                              onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                              className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-2"
                              rows={3}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingCategory(null)}
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
                            {category.name}
                          </h4>
                          {category.description && (
                            <p className="text-gray-400 mt-1">{category.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-500">
                              Slug: <code className="bg-gray-700 px-2 py-1 rounded">{category.slug}</code>
                            </span>
                            <span className={`text-sm ${category.isActive ? 'text-green-400' : 'text-red-400'}`}>
                              {category.isActive ? '● Actif' : '● Inactif'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingCategory(category)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => category._id && handleDelete(category._id)}
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

        {categories.length === 0 && (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-white/10">
            <Tag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Aucune catégorie créée pour le moment</p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Créer la première catégorie
            </button>
          </div>
        )}
      </div>
    </div>
  );
}