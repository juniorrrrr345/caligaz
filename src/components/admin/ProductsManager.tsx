'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import MediaUploader from './MediaUploader';
import CloudinaryUploader from './CloudinaryUploader';
import CloudinaryDirectUploader from './CloudinaryDirectUploader';

interface Product {
  _id?: string;
  name: string;
  category: string;
  farm: string;
  menu: string;
  image: string;
  images?: string[];
  video?: string;
  prices: {
    [key: string]: number;
  };
  promotions?: {
    [key: string]: number;
  };
  description?: string;
  isActive: boolean;
}

const defaultPriceKeys = ['3g', '5g', '10g', '25g', '50g', '100g', '200g', '500g'];

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [farms, setFarms] = useState<string[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    farm: '',
    menu: 'caligaz',
    image: '',
    images: [],
    video: '',
    prices: {},
    description: '',
    isActive: true
  });
  const [activeTab, setActiveTab] = useState<'infos' | 'media' | 'prix'>('infos');
  // États locaux pour les champs de prix pour éviter la perte de focus
  const [priceInputs, setPriceInputs] = useState<{ [key: string]: string }>({});
  // États locaux pour les quantités (séparés pour éviter les conflits)
  const [quantityInputs, setQuantityInputs] = useState<{ [key: string]: string }>({});
  // États locaux pour les promotions
  const [promotionInputs, setPromotionInputs] = useState<{ [key: string]: string }>({});
  // Ref pour maintenir le focus
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Début du chargement des données...');
      
      // Charger les produits
      console.log('📦 Chargement des produits...');
      const productsRes = await fetch('/api/products');
      console.log('📦 Réponse produits:', productsRes.status);
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        console.log('📦 Produits chargés:', productsData.length, productsData);
        setProducts(productsData);
      } else {
        console.error('❌ Erreur produits:', productsRes.status);
        setProducts([]); // Fallback to empty array
      }

      // Charger les catégories
      console.log('🏷️ Chargement des catégories...');
      const categoriesRes = await fetch('/api/categories');
      console.log('🏷️ Réponse catégories:', categoriesRes.status);
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        console.log('🏷️ Catégories chargées:', categoriesData.length, categoriesData);
        setCategories(categoriesData.map((c: { name: string }) => c.name));
      } else {
        console.error('❌ Erreur catégories:', categoriesRes.status);
        setCategories([]);
      }

      // Charger les farms
      console.log('🏭 Chargement des farms...');
      const farmsRes = await fetch('/api/farms');
      console.log('🏭 Réponse farms:', farmsRes.status);
      if (farmsRes.ok) {
        const farmsData = await farmsRes.json();
        console.log('🏭 Farms chargées:', farmsData.length, farmsData);
        setFarms(farmsData.map((f: { name: string }) => f.name));
      } else {
        console.error('❌ Erreur farms:', farmsRes.status);
        setFarms([]);
      }

      // Charger les menus
      console.log('📋 Chargement des menus...');
      const menusRes = await fetch('/api/menus');
      console.log('📋 Réponse menus:', menusRes.status);
      if (menusRes.ok) {
        const menusData = await menusRes.json();
        console.log('📋 Menus chargés:', menusData.length, menusData);
        setMenus(menusData);
      } else {
        console.error('❌ Erreur menus:', menusRes.status);
        setMenus([{ slug: 'caligaz', name: 'CaliGaz', emoji: '⛽' }]); // Menu par défaut
      }
      
      console.log('✅ Chargement terminé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      // En cas d'erreur, on s'assure que loading devient false
      setProducts([]);
      setCategories([]);
      setFarms([]);
      setMenus([{ slug: 'caligaz', name: 'CaliGaz', emoji: '⛽' }]);
    } finally {
      setLoading(false);
      console.log('🏁 Loading mis à false');
    }
  };

  const handleEdit = (product: Product) => {
    console.log('✏️ Édition du produit:', product.name, 'Prix:', product.prices);
    setEditingProduct(product);
    setFormData({
      ...product,
      prices: { ...product.prices },
      promotions: { ...product.promotions } || {}
    });
    // Synchroniser les états locaux des prix
    const priceStrings: { [key: string]: string } = {};
    const quantityStrings: { [key: string]: string } = {};
    const promotionStrings: { [key: string]: string } = {};
    
    // Traiter tous les prix existants, même ceux avec des valeurs null/undefined
    Object.entries(product.prices || {}).forEach(([key, value]) => {
      priceStrings[key] = (value !== null && value !== undefined && value !== 0) ? value.toString() : '';
      quantityStrings[key] = key; // La quantité est la clé
    });
    
    // Traiter les promotions existantes
    Object.entries(product.promotions || {}).forEach(([key, value]) => {
      promotionStrings[key] = (value !== null && value !== undefined && value !== 0) ? value.toString() : '';
    });
    
    console.log('💰 Prix initialisés:', priceStrings);
    console.log('📏 Quantités initialisées:', quantityStrings);
    console.log('🎁 Promotions initialisées:', promotionStrings);
    
    setPriceInputs(priceStrings);
    setQuantityInputs(quantityStrings);
    setPromotionInputs(promotionStrings);
    setActiveTab('infos'); // Reset tab to infos
    setShowModal(true);
    
    // Forcer un refresh pour que les données apparaissent
    setRefreshCounter(prev => prev + 1);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    // Commencer avec un produit complètement vide mais garder les champs
    setFormData({
      name: '',
      category: '',
      farm: '',
      menu: 'caligaz',
      image: '',
      video: '',
      prices: {},
      description: '',
      isActive: true
    });
    // Aucun prix par défaut - interface complètement vide
    setPriceInputs({});
    setQuantityInputs({});
    setPromotionInputs({});
    setActiveTab('infos'); // Reset tab to infos
    setShowModal(true);
  };

  // Fonction pour synchroniser les états locaux avec formData avant sauvegarde
  const syncLocalStatesWithFormData = () => {
    const finalPrices: { [key: string]: number } = {};
    
    // Récupérer TOUS les inputs de prix et quantité dans le modal
    const modal = document.querySelector('[role="dialog"], .modal, .fixed');
    if (modal) {
      const priceInputs = modal.querySelectorAll('input[type="number"]');
      const quantityInputs = modal.querySelectorAll('input[type="text"]');
      
      // Parcourir chaque ligne de prix
      quantityInputs.forEach((quantityInput, index) => {
        const quantity = (quantityInput as HTMLInputElement).value.trim();
        const priceInput = priceInputs[index] as HTMLInputElement;
        
        if (quantity && priceInput && priceInput.value !== '') {
          const numericValue = parseFloat(priceInput.value);
          if (!isNaN(numericValue) && numericValue > 0) {
            finalPrices[quantity] = numericValue;
          }
        }
      });
    }
    
    // Aussi récupérer depuis les objets états locaux
    Object.entries(priceInputs).forEach(([key, value]) => {
      if (value && value !== '') {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue > 0) {
          finalPrices[key] = numericValue;
        }
      }
    });
    
    console.log('💾 Prix récupérés pour sauvegarde:', finalPrices);
    
    setFormData(prev => ({
      ...prev,
      prices: finalPrices
    }));
  };

  const handleSave = async () => {
    console.log('🔵 Bouton sauvegarder cliqué');
    
    if (!formData.name || !formData.farm || !formData.menu || !formData.category) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Vérifier que nous avons bien une image
    if (!formData.image) {
      alert('Veuillez ajouter une image au produit');
      return;
    }
    
    // RÉCUPÉRER LES PRIX ET PROMOTIONS DIRECTEMENT ICI POUR LA SAUVEGARDE
    const finalPrices: { [key: string]: number } = {};
    const finalPromotions: { [key: string]: number } = {};
    
    console.log('🔍 DEBUG: Récupération des prix et promotions...');
    
    // Récupérer TOUS les inputs dans la page (pas juste le modal)
    const allNumberInputs = document.querySelectorAll('input[type="number"]');
    const allTextInputs = document.querySelectorAll('input[type="text"]');
    
    console.log('🔍 Inputs trouvés - Numbers:', allNumberInputs.length, 'Text:', allTextInputs.length);
    
    // Aussi récupérer depuis les états locaux directement
    console.log('🔍 États locaux - priceInputs:', priceInputs, 'quantityInputs:', quantityInputs, 'promotionInputs:', promotionInputs);
    
    // Utiliser les états locaux comme source principale
    Object.keys(priceInputs).forEach(key => {
      const priceValue = priceInputs[key];
      if (priceValue && priceValue !== '') {
        const numericValue = parseFloat(priceValue);
        if (!isNaN(numericValue) && numericValue > 0) {
          finalPrices[key] = numericValue;
        }
      }
    });
    
    // Récupérer les promotions
    Object.keys(promotionInputs).forEach(key => {
      const promoValue = promotionInputs[key];
      if (promoValue && promoValue !== '') {
        const numericValue = parseFloat(promoValue);
        if (!isNaN(numericValue) && numericValue > 0 && numericValue <= 100) {
          finalPromotions[key] = numericValue;
        }
      }
    });
    
    // Aussi récupérer depuis quantityInputs si pas déjà dans priceInputs
    Object.keys(quantityInputs).forEach(key => {
      if (!(key in finalPrices)) {
        // Chercher si il y a un prix pour cette quantité
        const priceValue = priceInputs[key];
        if (priceValue && priceValue !== '') {
          const numericValue = parseFloat(priceValue);
          if (!isNaN(numericValue) && numericValue > 0) {
            finalPrices[key] = numericValue;
          }
        }
      }
    });
    
    console.log('💾 Prix à sauvegarder:', finalPrices);
    console.log('💾 Nombre de prix trouvés:', Object.keys(finalPrices).length);
    console.log('🎁 Promotions à sauvegarder:', finalPromotions);
    
    // Vérifier qu'on a au moins un prix
    if (Object.keys(finalPrices).length === 0) {
      alert('Veuillez définir au moins un prix pour le produit');
      return;
    }

    console.log('🔍 Debug handleSave:', {
      editingProduct: editingProduct,
      editingProductId: editingProduct?._id,
      formDataSnapshot: { ...formData }
    });

    setIsSaving(true);
    
    try {
      // Utiliser les prix récupérés directement depuis les inputs
      const cleanedPrices = finalPrices;

      const cleanedFormData = {
        ...formData,
        prices: cleanedPrices,
        promotions: finalPromotions
      };

      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      // Vérifier la taille de la requête avant envoi
      const requestSize = JSON.stringify(cleanedFormData).length;
      const requestSizeMB = requestSize / 1024 / 1024;
      
      console.log('📏 Taille requête:', {
        bytes: requestSize,
        MB: Math.round(requestSizeMB * 100) / 100,
        hasImage: !!cleanedFormData.image,
        hasVideo: !!cleanedFormData.video
      });
      
      if (requestSizeMB > 45) { // Limite à 45MB pour laisser de la marge
        alert(`Requête trop volumineuse (${Math.round(requestSizeMB)}MB). Réduisez la taille des images/vidéos.`);
        return;
      }

      console.log('💾 Sauvegarde produit:', {
        url,
        method,
        dataSizeMB: Math.round(requestSizeMB * 100) / 100,
        editingProduct: editingProduct ? { 
          id: editingProduct._id, 
          name: editingProduct.name 
        } : null,
        isUpdate: !!editingProduct
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedFormData),
      });

      console.log('📡 Réponse sauvegarde:', response.status, response.statusText);

      if (response.ok) {
        // Afficher un message de succès
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        successMsg.textContent = editingProduct ? '✅ Produit modifié avec succès!' : '✅ Produit ajouté avec succès!';
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
          successMsg.remove();
        }, 3000);
        
        setShowModal(false);
        
        // Forcer la synchronisation immédiate
        try {
          // Invalider le cache côté client
          const cacheResponse = await fetch('/api/cache/invalidate', { method: 'POST' });
          console.log('🔄 Cache invalidé:', cacheResponse.ok);
        } catch (error) {
          console.error('Erreur invalidation cache:', error);
        }
        
        // Recharger les données
        await loadData();
        
        // Forcer un refresh de la page boutique si elle est ouverte
        if (window.opener || window.parent !== window) {
          try {
            window.opener?.location.reload();
          } catch (e) {
            console.log('Pas de fenêtre parent à rafraîchir');
          }
        }
      } else {
        // Récupérer le détail de l'erreur
        const errorData = await response.text();
        console.error('❌ Erreur sauvegarde détaillée:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData
        });

        // Afficher un message d'erreur
        const errorMsg = document.createElement('div');
        errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999]';
        errorMsg.textContent = `❌ Erreur ${response.status}: ${response.statusText}`;
        document.body.appendChild(errorMsg);
        
        setTimeout(() => {
          errorMsg.remove();
        }, 3000);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    console.log('🗑️ Tentative de suppression du produit:', productId);

    try {
      // Afficher un loader pendant la suppression
      const loadingMsg = document.createElement('div');
      loadingMsg.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
      loadingMsg.textContent = '⏳ Suppression en cours...';
      document.body.appendChild(loadingMsg);

      // Envoyer la requête de suppression AVANT de mettre à jour l'interface
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      // Supprimer le message de chargement
      loadingMsg.remove();

      if (response.ok) {
        // Suppression réussie - mettre à jour l'interface
        setProducts(prev => prev.filter(p => p._id !== productId));
        
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        successMsg.textContent = '✅ Produit supprimé avec succès!';
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
          successMsg.remove();
        }, 3000);

        console.log('✅ Produit supprimé avec succès:', productId);
      } else {
        // Erreur côté serveur
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        console.error('❌ Erreur suppression serveur:', response.status, errorData);
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999]';
        errorMsg.textContent = `❌ Erreur: ${errorData.error || 'Impossible de supprimer le produit'}`;
        document.body.appendChild(errorMsg);
        
        setTimeout(() => {
          errorMsg.remove();
        }, 5000);

        // Recharger les données pour s'assurer de la cohérence
        await loadData();
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999]';
      errorMsg.textContent = '❌ Erreur de connexion lors de la suppression';
      document.body.appendChild(errorMsg);
      
      setTimeout(() => {
        errorMsg.remove();
      }, 5000);
    }
  };

  const updateField = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updatePrice = useCallback((priceKey: string, value: string) => {
    // Stocker dans l'objet ET dans l'état local pour être sûr
    priceInputs[priceKey] = value;
    setPriceInputs(prev => ({
      ...prev,
      [priceKey]: value
    }));
    console.log('💰 Prix mis à jour:', priceKey, '=', value);
  }, []);

  const updatePromotion = useCallback((priceKey: string, value: string) => {
    // Stocker dans l'objet ET dans l'état local pour être sûr
    promotionInputs[priceKey] = value;
    setPromotionInputs(prev => ({
      ...prev,
      [priceKey]: value
    }));
    console.log('🎁 Promotion mise à jour:', priceKey, '=', value);
  }, []);

  // Composant de champ de prix isolé pour éviter les re-renders
  const PriceInput = useCallback(({ priceKey, value }: { priceKey: string; value?: number | undefined }) => {
    return (
      <input
        key={`price-${priceKey}`} // Clé unique pour chaque champ
        ref={(el) => { if (el) inputRefs.current[priceKey] = el; }}
        type="number"
        defaultValue={value !== undefined && value !== null && value !== 0 ? value.toString() : ''}
              onChange={(e) => {
        // Stocker ET mettre à jour l'état
        const value = e.target.value;
        priceInputs[priceKey] = value;
        updatePrice(priceKey, value);
      }}
        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
        placeholder="Prix en €"
        step="0.01"
        inputMode="decimal"
        min="0"
      />
    );
  }, []);

  // Composant de champ de promotion isolé pour éviter les re-renders
  const PromotionInput = useCallback(({ priceKey, value }: { priceKey: string; value?: number | undefined }) => {
    return (
      <input
        key={`promo-${priceKey}`} // Clé unique pour chaque champ
        type="number"
        defaultValue={value !== undefined && value !== null && value !== 0 ? value.toString() : ''}
        onChange={(e) => {
          // Stocker ET mettre à jour l'état
          const value = e.target.value;
          promotionInputs[priceKey] = value;
          updatePromotion(priceKey, value);
        }}
        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
        placeholder="% de réduction"
        step="1"
        inputMode="numeric"
        min="0"
        max="100"
      />
    );
  }, []);

  // Composant pour les champs de quantité sans perte de focus
  const QuantityInput = useCallback(({ priceKey }: { priceKey: string }) => {
    return (
      <input
        key={`quantity-${priceKey}`} // Clé unique pour chaque champ
        type="text"
        defaultValue={priceKey}
              onChange={(e) => {
        // Stocker ET mettre à jour l'état  
        const value = e.target.value;
        quantityInputs[priceKey] = value;
        setQuantityInputs(prev => ({
          ...prev,
          [priceKey]: value
        }));
        console.log('📏 Quantité mise à jour:', priceKey, '→', value);
      }}
        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
        placeholder="3g, 5g, 10g..."
      />
    );
  }, []);

  // Fonction pour obtenir tous les prix à afficher (TOUJOURS garder les lignes même vides)
  const getAllPriceEntries = () => {
    const allPrices: { [key: string]: number | undefined } = {};
    
    console.log('🔍 getAllPriceEntries - formData.prices:', formData.prices);
    console.log('🔍 getAllPriceEntries - priceInputs:', priceInputs);
    console.log('🔍 getAllPriceEntries - quantityInputs:', quantityInputs);
    
    // Ajouter les prix existants dans formData (même les valeurs null/undefined)
    Object.entries(formData.prices || {}).forEach(([key, value]) => {
      allPrices[key] = value;
    });
    
    // Ajouter TOUS les prix des états locaux (même si complètement vides)
    Object.keys(priceInputs).forEach((key) => {
      if (!(key in allPrices)) {
        allPrices[key] = undefined; // Pas de valeur, juste présence pour affichage
      }
    });
    
    // Ajouter TOUTES les quantités des états locaux (même si complètement vides)
    Object.keys(quantityInputs).forEach((key) => {
      if (!(key in allPrices)) {
        allPrices[key] = undefined; // Pas de valeur, juste présence pour affichage
      }
    });

    // Ne pas ajouter de prix par défaut - l'utilisateur doit les ajouter manuellement
    
    const result = Object.entries(allPrices);
    console.log('🔍 getAllPriceEntries résultat final:', result);
    return result;
  };

  // Fonction utilitaire pour ajouter un nouveau prix - AUCUNE LIMITE
  const addNewPrice = (quantity: string) => {
    const key = quantity.trim();
    if (key) {
      console.log(`🔄 Tentative d'ajout prix: ${key}`);
      console.log(`📊 État actuel - priceInputs:`, Object.keys(priceInputs));
      console.log(`📊 État actuel - quantityInputs:`, Object.keys(quantityInputs));
      
      // Mettre à jour les états pour l'affichage des nouvelles lignes - SANS LIMITE
      setPriceInputs(prev => {
        const newState = {
          ...prev,
          [key]: ''
        };
        console.log(`📝 Nouveau priceInputs:`, Object.keys(newState));
        return newState;
      });
      
      setQuantityInputs(prev => {
        const newState = {
          ...prev,
          [key]: key
        };
        console.log(`📝 Nouveau quantityInputs:`, Object.keys(newState));
        return newState;
      });
      
      // Forcer un refresh pour que les lignes apparaissent
      setRefreshCounter(prev => prev + 1);
      
      console.log(`✅ Prix ajouté: ${key}`);
      console.log(`🔄 Refresh forcé:`, refreshCounter + 1);
    }
  };

  const addCustomPrice = () => {
    const customKey = prompt('Entrez la quantité (ex: 3g, 5g, 10g, 25g, 50g, 100g, 1kg, etc.):');
    if (customKey && customKey.trim()) {
      addNewPrice(customKey.trim());
    }
  };

  const removePrice = (priceKey: string) => {
    setFormData(prev => {
      const newPrices = { ...prev.prices };
      delete newPrices[priceKey];
      return { ...prev, prices: newPrices };
    });
    setPriceInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[priceKey];
      return newInputs;
    });
    setQuantityInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[priceKey];
      return newInputs;
    });
  };

  const handlePriceKeyChange = (oldKey: string, newKey: string) => {
    // Ne pas faire de changement si c'est la même valeur
    if (newKey === oldKey) return;
    
    // PERMETTRE LES CHAMPS VIDES SANS SUPPRIMER LA LIGNE
    if (newKey.trim() === '') {
      // Garder la ligne mais avec une clé temporaire vide
      // On ne fait rien ici pour éviter la perte de focus
      return;
    }
    
    // Seulement renommer si différent et non vide
    setFormData(prev => {
      const updatedPrices = { ...prev.prices };
      updatedPrices[newKey.trim()] = updatedPrices[oldKey] || 0;
      delete updatedPrices[oldKey];
      return { ...prev, prices: updatedPrices };
    });
    
    setPriceInputs(prev => {
      const updatedInputs = { ...prev };
      updatedInputs[newKey.trim()] = updatedInputs[oldKey] || '';
      delete updatedInputs[oldKey];
      return updatedInputs;
    });
  };

  const cleanAllPrices = async () => {
    if (confirm('Voulez-vous nettoyer tous les prix undefined/invalides dans la base de données ?')) {
      try {
        const response = await fetch('/api/products/clean-prices', {
          method: 'POST'
        });
        
        if (response.ok) {
          const result = await response.json();
          alert(`✅ ${result.message}`);
          loadData(); // Recharger les données
        } else {
          alert('❌ Erreur lors du nettoyage');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur lors du nettoyage');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Chargement des produits...</div>
      </div>
    );
  }

  console.log('🎯 Rendu ProductsManager - Produits:', products.length, 'Catégories:', categories.length, 'Menus:', menus.length);

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">🛍️ Gestion des Produits</h1>
            <p className="text-gray-400 mt-2">Gérez votre catalogue de produits CaliGaz ⛽️</p>
          </div>
                  <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAdd}
            className="bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:scale-[1.02] w-full sm:w-auto"
          >
            ➕ Ajouter un produit
          </button>
          <button
            onClick={cleanAllPrices}
            className="bg-yellow-600/10 border border-yellow-500/20 hover:bg-yellow-600/20 text-yellow-300 font-bold py-3 px-6 rounded-xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:scale-[1.02] w-full sm:w-auto"
          >
            🧹 Nettoyer les prix
          </button>
        </div>
        </div>
      </div>

      {/* Alerte pour les prix problématiques */}
      {products.some(p => Object.values(p.prices || {}).some(price => !price || isNaN(Number(price)) || Number(price) <= 0)) && (
        <div className="bg-red-900/20 border border-red-400/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-red-400 text-xl">⚠️</div>
            <div>
              <h3 className="text-red-400 font-bold">Problème détecté avec les prix</h3>
              <p className="text-red-300 text-sm">
                Certains produits ont des prix invalides (null, undefined, 0 ou non-numériques). 
                Utilisez le bouton "🧹 Nettoyer les prix" pour résoudre automatiquement ces problèmes.
              </p>
            </div>
            <button
              onClick={cleanAllPrices}
              className="bg-red-600/20 border border-red-400/30 hover:bg-red-600/30 text-red-300 font-bold py-2 px-4 rounded-lg transition-all duration-200 whitespace-nowrap"
            >
              🧹 Nettoyer maintenant
            </button>
          </div>
        </div>
      )}

      {/* Grid de produits - Plus compact */}
      {products.length === 0 ? (
        <div className="bg-gray-900/50 border border-white/20 rounded-xl p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-400 mb-4">
            Les produits se chargent ou il n'y en a aucun dans la base de données.
          </p>
          <p className="text-sm text-gray-500">
            Vérifiez la console pour plus de détails ou initialisez la base avec /api/init-db
          </p>
        </div>
      ) : (
        <>
        {/* Version mobile - Liste verticale */}
        <div className="block lg:hidden space-y-3">
          {products.map((product) => (
            <div key={product._id} className="bg-gray-900/50 border border-white/20 rounded-xl overflow-hidden shadow-lg backdrop-blur-sm">
              <div className="flex items-center p-3 space-x-3">
                {/* Image compacte */}
                <div className="relative w-16 h-16 flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center ${
                    product.isActive ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {product.isActive ? '✓' : '✗'}
                  </div>
                </div>
                
                {/* Infos principales */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm truncate uppercase tracking-wide">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    {menus.find(m => m.slug === product.menu)?.name || product.menu} • {product.category}
                  </p>
                  

                  
                  {/* Prix compacts */}
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(product.prices || {}).slice(0, 3).map(([key, value]) => (
                      <span key={key} className="bg-white/10 text-white text-xs px-2 py-1 rounded">
                        {key}: {value}€
                      </span>
                    ))}
                    {Object.keys(product.prices || {}).length > 3 && (
                      <span className="text-gray-500 text-xs">+{Object.keys(product.prices).length - 3}</span>
                    )}
                  </div>
                </div>
                
                {/* Boutons d'action compacts */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all duration-200 border border-white/10"
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => product._id && handleDelete(product._id)}
                    className="bg-red-900/20 border border-red-400/20 hover:bg-red-900/40 text-red-400 p-2 rounded-lg transition-all duration-200"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Version desktop - Grille */}
        <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {products.map((product) => (
          <div key={product._id} className="bg-gray-900/50 border border-white/20 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
            <div className="relative h-32">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-white/90 text-black text-xs font-bold px-2 py-1 rounded-md">
                {product.category}
              </div>
              {product.video && (
                <div className="absolute top-2 right-2 bg-black/80 text-white p-1 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                </div>
              )}
              <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                product.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {product.isActive ? '✅' : '❌'}
              </div>
            </div>
            
            <div className="p-3">
              <h3 className="font-bold text-white text-sm mb-1 uppercase tracking-wide">
                {product.name}
              </h3>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                {menus.find(m => m.slug === product.menu)?.name || product.menu}
              </p>
              
              {/* Prix principaux */}
              <div className="mb-3">
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {Object.entries(product.prices || {}).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-gray-300">
                      <span>{key}</span>
                      <span className="font-medium">{value}€</span>
                    </div>
                  ))}
                </div>
                {Object.keys(product.prices || {}).length > 4 && (
                  <p className="text-gray-500 text-xs mt-1">+{Object.keys(product.prices || {}).length - 4} prix...</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-3 rounded-lg text-xs transition-all duration-200 border border-white/10"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => product._id && handleDelete(product._id)}
                  className="bg-red-900/20 border border-red-400/20 hover:bg-red-900/40 text-red-400 font-medium py-2 px-3 rounded-lg text-xs transition-all duration-200"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
        </>
      )}

      {/* Modal d'édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-start justify-center p-0 sm:p-4 z-[99999] overflow-y-auto lg:items-center">
          <div className="bg-gray-900 border-0 sm:border border-white/20 rounded-none sm:rounded-xl w-full max-w-4xl my-0 lg:my-4 backdrop-blur-sm min-h-[100vh] sm:min-h-0 sm:max-h-[95vh] flex flex-col pb-20 sm:pb-0">
            {/* Header fixe avec bouton fermer mobile */}
            <div className="p-3 sm:p-6 border-b border-white/20 flex-shrink-0 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {editingProduct ? '✏️ Modifier le produit' : '➕ Ajouter un produit'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="sm:hidden bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all duration-300"
              >
                ✕
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
              {/* Navigation par onglets sur mobile */}
              <div className="sm:hidden mb-4">
                <div className="flex border-b border-white/20">
                  <button
                    onClick={() => setActiveTab('infos')}
                    className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                      activeTab === 'infos' 
                        ? 'text-white border-b-2 border-white' 
                        : 'text-gray-400'
                    }`}
                  >
                    📝 Infos
                  </button>
                  <button
                    onClick={() => setActiveTab('media')}
                    className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                      activeTab === 'media' 
                        ? 'text-white border-b-2 border-white' 
                        : 'text-gray-400'
                    }`}
                  >
                    🖼️ Média
                  </button>
                  <button
                    onClick={() => setActiveTab('prix')}
                    className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                      activeTab === 'prix' 
                        ? 'text-white border-b-2 border-white' 
                        : 'text-gray-400'
                    }`}
                  >
                    💰 Prix
                  </button>
                </div>
              </div>

              {/* Vue desktop - colonnes */}
              <div className="hidden sm:grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Informations de base */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Informations de base</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom du produit</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="COOKIES GELATO"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Menu</label>
                  <select
                    value={formData.menu || 'caligaz'}
                    onChange={(e) => updateField('menu', e.target.value)}
                    className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    {menus.map((menu) => (
                      <option key={menu.slug} value={menu.slug}>
                        {menu.emoji} {menu.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Farm</label>
                  <select
                    value={formData.farm || ''}
                    onChange={(e) => updateField('farm', e.target.value)}
                    className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="">Sélectionner une farm</option>
                    {farms.map((farm) => (
                      <option key={farm} value={farm}>{farm}</option>
                    ))}
                  </select>
                </div>



                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Image du produit</label>
                    
                    <div className="bg-gray-800/50 border border-white/10 rounded-lg p-4 mb-3">
                      <div className="text-sm text-gray-300 mb-3 font-medium">Choisir la méthode d'upload :</div>
                      
                      {/* Upload Cloudinary Direct (recommandé) */}
                      <div className="mb-3">
                        <div className="text-xs text-green-400 mb-2">✅ Recommandé - Upload direct Cloudinary (Preset: caligaz)</div>
                        <CloudinaryDirectUploader
                          onMediaSelected={(url, type) => {
                            if (type === 'image') {
                              updateField('image', url);
                            }
                          }}
                          acceptedTypes="image/*"
                          label="📷 Choisir une image"
                          className="mb-2"
                        />
                      </div>
                      
                      {/* Upload base64 (pour petites images) */}
                      <div className="mb-3">
                        <div className="text-xs text-yellow-400 mb-2">⚠️ Base64 - Petites images seulement</div>
                        <MediaUploader
                          onMediaSelected={(url, type) => {
                            if (type === 'image') {
                              updateField('image', url);
                            }
                          }}
                          acceptedTypes="image/*"
                          maxSize={5}
                          className="mb-2"
                        />
                      </div>
                    </div>
                    
                    {/* Champ URL manuel */}
                    <div className="text-sm text-gray-400 mb-2">Ou entrer une URL manuellement :</div>
                    <input
                      type="text"
                      value={formData.image || ''}
                      onChange={(e) => updateField('image', e.target.value)}
                      className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="https://... ou data:image/..."
                    />
                    
                    {/* Préview de l'image */}
                    {formData.image && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-400 mb-2">Aperçu :</div>
                        <img 
                          src={formData.image} 
                          alt="Aperçu" 
                          className="w-32 h-20 object-cover rounded border border-white/20"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Vidéo du produit (optionnel)</label>
                    
                    <div className="bg-gray-800/50 border border-white/10 rounded-lg p-4 mb-3">
                      <div className="text-sm text-gray-300 mb-3 font-medium">Choisir la méthode d'upload :</div>
                      
                      {/* Upload Cloudinary Direct (recommandé pour vidéos) */}
                      <div className="mb-3">
                        <div className="text-xs text-green-400 mb-2">✅ Recommandé - Upload direct Cloudinary (Preset: caligaz)</div>
                        <CloudinaryDirectUploader
                          onMediaSelected={(url, type) => {
                            if (type === 'video') {
                              updateField('video', url);
                            }
                          }}
                          acceptedTypes="video/*,.mov,.avi,.3gp,.mp4"
                          label="🎥 Choisir une vidéo"
                          className="mb-2"
                        />
                      </div>
                      
                      {/* Upload base64 (très limité) */}
                      <div className="mb-3">
                        <div className="text-xs text-red-400 mb-2">❌ Base64 - Cause erreur 413 (non recommandé)</div>
                        <MediaUploader
                          onMediaSelected={(url, type) => {
                            if (type === 'video') {
                              updateField('video', url);
                            }
                          }}
                          acceptedTypes="video/*"
                          maxSize={5} // Très réduit pour éviter erreur 413
                          className="mb-2"
                        />
                      </div>
                    </div>
                    
                    {/* Champ URL manuel */}
                    <div className="text-sm text-gray-400 mb-2">Ou entrer une URL manuellement :</div>
                    <input
                      type="text"
                      value={formData.video || ''}
                      onChange={(e) => updateField('video', e.target.value)}
                      className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="https://... ou data:video/..."
                    />
                    
                    {/* Préview de la vidéo */}
                    {formData.video && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-400 mb-2">Aperçu :</div>
                        <video 
                          src={formData.video} 
                          className="w-32 h-20 object-cover rounded border border-white/20"
                          controls
                          muted
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 h-20"
                    placeholder="Description du produit..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive || false}
                    onChange={(e) => updateField('isActive', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-300">Produit actif</label>
                </div>
              </div>

              {/* Gestion des prix */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Prix</h3>
                    <button
                      type="button"
                      onClick={addCustomPrice}
                      className="bg-white/10 border border-white/20 hover:bg-white/20 text-white text-sm py-2 px-4 rounded-lg transition-all duration-200"
                    >
                      ➕ Ajouter prix
                    </button>
                  </div>
                  
                  {/* Raccourcis pour prix courants */}
                  <div className="flex flex-wrap gap-2">
                    {['3g', '5g', '10g', '25g', '50g', '100g', '200g', '500g', '1kg'].map(quantity => (
                      <button
                        key={quantity}
                        type="button"
                        onClick={() => {
                          console.log(`🎯 Clic sur bouton: ${quantity}`);
                          addNewPrice(quantity);
                        }}
                        className="bg-blue-600/20 border border-blue-400/30 hover:bg-blue-600/40 text-blue-300 text-xs py-1 px-2 rounded transition-all duration-200"
                        title={`Ajouter ${quantity}`}
                      >
                        + {quantity}
                      </button>
                    ))}
                  </div>
                  <button
  type="button"
  onClick={() => {
    console.log('🔍 DEBUG MANUAL - priceInputs:', priceInputs);
    console.log('🔍 DEBUG MANUAL - quantityInputs:', quantityInputs);
    console.log('🔍 DEBUG MANUAL - getAllPriceEntries():', getAllPriceEntries());
    setRefreshCounter(prev => prev + 1);
  }}
  className="bg-red-600/20 border border-red-400/30 hover:bg-red-600/40 text-red-300 text-xs py-1 px-2 rounded"
>
  🔍 DEBUG
</button>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {getAllPriceEntries().length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p className="mb-2">Aucun prix défini</p>
                      <p className="text-sm">Cliquez sur "➕ Ajouter prix" pour commencer</p>
                      <p className="text-xs mt-2">Debug refresh: {refreshCounter}</p>
                    </div>
                  ) : (
                    getAllPriceEntries().map(([priceKey, value]) => (
                    <div key={priceKey} className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Quantité</label>
                        <QuantityInput priceKey={priceKey} />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Prix (€)</label>
                        <PriceInput priceKey={priceKey} value={value} />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Promo (%)</label>
                        <PromotionInput priceKey={priceKey} value={formData.promotions?.[priceKey]} />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePrice(priceKey)}
                        className="text-red-400 hover:text-red-300 p-2 transition-colors mt-5"
                        title="Supprimer ce prix"
                      >
                        🗑️
                                              </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              </div>

              {/* Vue mobile - onglets */}
              <div className="sm:hidden space-y-4">
                {/* Onglet Infos */}
                {activeTab === 'infos' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nom du produit</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder="COOKIES GELATO"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Menu</label>
                      <select
                        value={formData.menu || 'caligaz'}
                        onChange={(e) => updateField('menu', e.target.value)}
                        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                      >
                        {menus.map((menu) => (
                          <option key={menu.slug} value={menu.slug}>
                            {menu.emoji} {menu.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                      <select
                        value={formData.category || ''}
                        onChange={(e) => updateField('category', e.target.value)}
                        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Farm</label>
                      <select
                        value={formData.farm || ''}
                        onChange={(e) => updateField('farm', e.target.value)}
                        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                      >
                        <option value="">Sélectionner une farm</option>
                        {farms.map((farm) => (
                          <option key={farm} value={farm}>{farm}</option>
                        ))}
                      </select>
                    </div>



                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => updateField('description', e.target.value)}
                        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 h-20"
                        placeholder="Description du produit..."
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActiveMobile"
                        checked={formData.isActive || false}
                        onChange={(e) => updateField('isActive', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="isActiveMobile" className="text-sm text-gray-300">Produit actif</label>
                    </div>
                  </div>
                )}

                {/* Onglet Média */}
                {activeTab === 'media' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Image du produit</label>
                      <CloudinaryDirectUploader
                        onMediaSelected={(url, type) => {
                          if (type === 'image') {
                            updateField('image', url);
                          }
                        }}
                        acceptedTypes="image/*"
                        label="📷 Uploader une image"
                        className="mb-3"
                      />
                      <input
                        type="text"
                        value={formData.image || ''}
                        onChange={(e) => updateField('image', e.target.value)}
                        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder="URL de l'image..."
                      />
                      {formData.image && (
                        <img 
                          src={formData.image} 
                          alt="Aperçu" 
                          className="w-32 h-20 object-cover rounded border border-white/20 mt-2"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Vidéo (optionnel)</label>
                      <CloudinaryDirectUploader
                        onMediaSelected={(url, type) => {
                          if (type === 'video') {
                            updateField('video', url);
                          }
                        }}
                        acceptedTypes="video/*,.mp4,.mov,.avi"
                        label="🎥 Uploader une vidéo"
                        className="mb-3"
                      />
                      <input
                        type="text"
                        value={formData.video || ''}
                        onChange={(e) => updateField('video', e.target.value)}
                        className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder="URL de la vidéo..."
                      />
                      {formData.video && (
                        <video 
                          src={formData.video} 
                          className="w-32 h-20 object-cover rounded border border-white/20 mt-2"
                          controls
                          muted
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Onglet Prix */}
                {activeTab === 'prix' && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Prix</h3>
                        <button
                          type="button"
                          onClick={addCustomPrice}
                          className="bg-white/10 border border-white/20 hover:bg-white/20 text-white text-sm py-2 px-4 rounded-lg transition-all duration-200"
                        >
                          ➕ Ajouter
                        </button>
                      </div>
                      
                      {/* Raccourcis mobiles */}
                      <div className="flex flex-wrap gap-2">
                        {['3g', '5g', '10g', '25g', '50g', '100g', '200g', '500g', '1kg'].map(quantity => (
                          <button
                            key={quantity}
                            type="button"
                            onClick={() => {
                              console.log(`📱 Clic mobile sur: ${quantity}`);
                              addNewPrice(quantity);
                            }}
                            className="bg-blue-600/20 border border-blue-400/30 hover:bg-blue-600/40 text-blue-300 text-xs py-1 px-2 rounded transition-all duration-200"
                            title={`Ajouter ${quantity}`}
                          >
                            + {quantity}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {getAllPriceEntries().length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <p className="mb-2">Aucun prix défini</p>
                          <p className="text-sm">Cliquez sur "➕ Ajouter prix" pour commencer</p>
                          <p className="text-xs mt-2">Debug refresh mobile: {refreshCounter}</p>
                        </div>
                      ) : (
                        getAllPriceEntries().map(([priceKey, value]) => (
                        <div key={priceKey} className="bg-gray-800/50 border border-white/10 rounded-lg p-3">
                          <div className="space-y-2">
                                                          <div>
                                <label className="block text-xs text-gray-400 mb-1">Quantité</label>
                                <QuantityInput priceKey={priceKey} />
                              </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Prix (€)</label>
                              <PriceInput priceKey={priceKey} value={value} />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Promotion (%)</label>
                              <PromotionInput priceKey={priceKey} value={formData.promotions?.[priceKey]} />
                            </div>
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => removePrice(priceKey)}
                                className="bg-red-900/20 border border-red-400/20 hover:bg-red-900/40 text-red-400 p-2 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Boutons fixes en bas - optimisés mobile */}
            <div className="p-3 sm:p-4 lg:p-6 border-t border-white/20 bg-gray-900 flex-shrink-0 rounded-b-xl sticky bottom-0">
              <div className="flex gap-2 sm:gap-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex-1 ${isSaving ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-2 sm:py-3 px-3 sm:px-4 lg:px-6 rounded-lg lg:rounded-xl transition-all duration-300 shadow-lg text-xs sm:text-sm lg:text-base disabled:cursor-not-allowed`}
                >
                  {isSaving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 lg:px-6 rounded-lg lg:rounded-xl transition-all duration-300 text-xs sm:text-sm lg:text-base"
                >
                  ❌ Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}