'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange
}: CategoryFilterProps) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Fermer les dropdowns quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {/* Sélecteur de catégories */}
        <div className="relative flex-1" ref={categoryRef}>
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between hover:bg-white/15 transition-all duration-200 group"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-green-400 text-lg">🏷️</span>
              <span className="text-sm sm:text-base font-medium truncate">{selectedCategory}</span>
            </div>
            <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''} group-hover:text-green-400`} />
          </button>

          {/* Dropdown des catégories */}
          {showCategoryDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden z-50 shadow-2xl animate-fadeIn">
              <div className="max-h-60 sm:max-h-80 overflow-y-auto custom-scrollbar">
                <div className="p-2 sm:p-3 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-wider">Catégories</span>
                    <span className="text-green-400 text-sm font-medium bg-green-500/20 px-2 py-1 rounded-lg">{categories.length - 1}</span>
                  </div>
                </div>
                
                <div className="p-1 sm:p-2">
                  {categories.map((category, index) => (
                    <button
                      key={category}
                      onClick={() => {
                        onCategoryChange(category);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-200 hover:bg-white/10 group ${
                        selectedCategory === category ? 'bg-white/25 text-white border-l-4 border-l-green-500' : 'text-white'
                      } ${index === 0 ? 'mb-2 border-b border-white/10 pb-2' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex-1 font-medium group-hover:translate-x-1 transition-transform">{category}</span>
                        {selectedCategory === category && (
                          <Check className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}