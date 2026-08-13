import React from 'react';
import { usePOS } from '../../hooks/usePOS';
import { Coffee, CupSoda, GlassWater, Cookie, IceCream, Heart, LayoutGrid } from 'lucide-react';

export const CategoryBar: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory } = usePOS();

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <LayoutGrid className="w-4 h-4" />;
      case 'CupSoda': return <Coffee className="w-4 h-4" />;
      case 'GlassWater': return <GlassWater className="w-4 h-4" />;
      case 'Cookie': return <Cookie className="w-4 h-4" />;
      case 'IceCream': return <IceCream className="w-4 h-4" />;
      default: return <Coffee className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
      {categories.map(cat => {
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 shrink-0 ${
              isSelected
                ? 'bg-[#3B2A1F] text-white shadow-sm'
                : 'bg-white dark:bg-[#1E1C1A] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            <span className={isSelected ? 'text-[#D4A373]' : 'text-stone-500 dark:text-stone-400'}>
              {getCategoryIcon(cat.icon_name)}
            </span>
            <span>{cat.name}</span>
          </button>
        );
      })}

      {/* Favorite Filter Toggle Pill */}
      <button
        onClick={() => setSelectedCategory(selectedCategory === 'cat-favorites' ? 'cat-all' : 'cat-favorites')}
        className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 shrink-0 ${
          selectedCategory === 'cat-favorites'
            ? 'bg-rose-600 text-white shadow-sm'
            : 'bg-white dark:bg-[#1E1C1A] text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30'
        }`}
      >
        <Heart className="w-4 h-4 fill-current" />
        <span>Favorit</span>
      </button>
    </div>
  );
};
