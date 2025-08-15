'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import CategoryFilter from '../components/CategoryFilter';
import ProductCard, { Product } from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';
import BottomNav from '../components/BottomNav';
import MenuSelection from '../components/MenuSelection';
import contentCache from '../lib/contentCache';
import { useMenu } from '@/contexts/MenuContext';
import { MenuType } from '@/types';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('Toutes les catégories');
  const [selectedFarm, setSelectedFarm] = useState('Toutes les farms');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('menu');
  const { selectedMenu, setSelectedMenu } = useMenu();
  const router = useRouter();
  
  // Précharger les autres pages pour navigation instantanée
  useEffect(() => {
    router.prefetch('/info');
    router.prefetch('/contact');
    router.prefetch('/social');
  }, [router]);
  
  // États pour les données - Initialiser avec des valeurs par défaut
  const [loading, setLoading] = useState(true); // Toujours true au départ
  
  // Gérer la logique de première visite côté client uniquement
  useEffect(() => {
    // Vérifier si c'est la première visite
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      // Si déjà visité, cacher le chargement immédiatement
      setLoading(false);
    } else {
      // Si première visite, marquer comme visité
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, []); // Ne s'exécute qu'une fois au montage
  
  // Charger le thème depuis l'API au démarrage
  useEffect(() => {
    const loadThemeForNewVisitors = async () => {
      try {
        // Charger les paramètres depuis l'API pour les nouveaux visiteurs
        const settingsRes = await fetch('/api/settings', { cache: 'no-store' });
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          
          // Sauvegarder dans localStorage pour les prochaines visites
          localStorage.setItem('shopSettings', JSON.stringify(settings));
          
          // Appliquer le thème immédiatement
          if (settings.backgroundImage) {
            const style = document.createElement('style');
            style.id = 'dynamic-theme-new-visitor';
            style.textContent = `
              html, body, .main-container {
                background-image: url(${settings.backgroundImage}) !important;
                background-size: cover !important;
                background-position: center !important;
                background-repeat: no-repeat !important;
                background-attachment: fixed !important;
              }
              .global-overlay {
                background-color: rgba(0, 0, 0, ${(settings.backgroundOpacity || 20) / 100}) !important;
                backdrop-filter: blur(${settings.backgroundBlur || 5}px) !important;
              }
            `;
            document.head.appendChild(style);
          }
        }
      } catch (error) {
        console.error('Erreur chargement thème:', error);
      }
    };
    
    // Charger le thème immédiatement pour les nouveaux visiteurs
    if (!localStorage.getItem('shopSettings')) {
      loadThemeForNewVisitors();
    }
  }, []);

  // Charger immédiatement depuis l'API - PAS depuis localStorage
  const getInitialProducts = () => {
    // Toujours retourner un tableau vide pour forcer le chargement depuis l'API
    return [];
  };
  
  const getInitialCategories = () => {
    // Toujours retourner les catégories par défaut pour forcer le chargement depuis l'API
    return ['Toutes les catégories'];
  };
  
  const getInitialFarms = () => {
    // Toujours retourner les farms par défaut pour forcer le chargement depuis l'API
    return ['Toutes les farms'];
  };
  
  const [products, setProducts] = useState<Product[]>(getInitialProducts());
  const [categories, setCategories] = useState<string[]>(getInitialCategories());
  const [farms, setFarms] = useState<string[]>(getInitialFarms());

  // CHARGEMENT DEPUIS L'API FILTRÉ PAR MENU
  useEffect(() => {
    if (!selectedMenu) return; // Attendre la sélection du menu
    
    // 1. D'abord charger depuis le cache pour affichage immédiat
    const cachedProducts = contentCache.getProducts();
    const cachedCategories = contentCache.getCategories();
    const cachedFarms = contentCache.getFarms();
    
    if (cachedProducts.length > 0) {
      setProducts(cachedProducts);
    }
    if (cachedCategories.length > 0) {
      setCategories(['Toutes les catégories', ...cachedCategories.map((c: any) => c.name)]);
    }
    if (cachedFarms.length > 0) {
      setFarms(['Toutes les farms', ...cachedFarms.map((f: any) => f.name)]);
    }
    
    // 2. Charger les données fraîches filtrées par menu en arrière-plan
    const loadFreshData = async () => {
      try {
        const [productsRes, categoriesRes, farmsRes] = await Promise.all([
          fetch('/api/products', { cache: 'no-store' }),
          fetch(`/api/categories?menu=${selectedMenu}`, { cache: 'no-store' }),
          fetch(`/api/farms?menu=${selectedMenu}`, { cache: 'no-store' })
        ]);

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          // Filtrer les produits par menu basé sur leurs catégories et farms
          setProducts(productsData);
          contentCache.updateProducts(productsData);
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(['Toutes les catégories', ...categoriesData.map((c: any) => c.name)]);
          contentCache.updateCategories(categoriesData);
        }

        if (farmsRes.ok) {
          const farmsData = await farmsRes.json();
          setFarms(['Toutes les farms', ...farmsData.map((f: any) => f.name)]);
          contentCache.updateFarms(farmsData);
        }
      } catch (error) {
        console.error('Erreur chargement données fraîches:', error);
      }
    };

    loadFreshData();
  }, [selectedMenu]); // Recharger quand le menu change

  // Timer de chargement - seulement pour les nouveaux visiteurs
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisited');
    
    if (!hasVisited) {
      // Si nouveau visiteur, afficher le loading pendant 3 secondes minimum
      const timer = setTimeout(() => {
        setLoading(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Calculer le contenu à afficher
  const getFilteredProducts = () => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'Toutes les catégories' || product.category === selectedCategory;
      const matchesFarm = selectedFarm === 'Toutes les farms' || product.farm === selectedFarm;
      return matchesCategory && matchesFarm;
    });
  };

  const filteredProducts = getFilteredProducts();

  const handleTabChange = (tabId: string) => {
    if (tabId === 'infos') {
      router.push('/info');
    } else if (tabId === 'social') {
      router.push('/social');
    } else if (tabId === 'contact') {
      router.push('/contact');
    } else {
      setActiveTab(tabId);
      if (tabId === 'menu') {
        setSelectedProduct(null);
      }
    }
  };

  const handleMenuSelect = (menu: MenuType) => {
    setSelectedMenu(menu);
  };

  const handleBackToMenuSelection = () => {
    setSelectedMenu(null);
  };

  // Afficher la sélection de menu si aucun menu n'est sélectionné
  if (!selectedMenu) {
    return <MenuSelection onMenuSelect={handleMenuSelect} />;
  }

  // Afficher l'écran de chargement pour les nouveaux visiteurs
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg mb-2">Chargement...</p>
          <p className="text-gray-400 text-sm">Préparation de votre boutique</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="global-overlay"></div>
      <div className="content-layer">
        {selectedProduct ? (
          <ProductDetail 
            product={selectedProduct} 
            onBack={() => setSelectedProduct(null)} 
          />
        ) : (
          <>
            <Header 
              selectedMenu={selectedMenu}
              onBackToMenuSelection={handleBackToMenuSelection}
            />
            <div className="px-4 py-2 space-y-4 pb-20">
              <CategoryFilter
                categories={categories}
                farms={farms}
                selectedCategory={selectedCategory}
                selectedFarm={selectedFarm}
                onCategoryChange={setSelectedCategory}
                onFarmChange={setSelectedFarm}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">Aucun produit trouvé</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Essayez de changer les filtres de catégorie ou de farm
                  </p>
                </div>
              )}
            </div>
            <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
          </>
        )}
      </div>
    </div>
  );
}