import React from 'react';
import { Category } from '../types';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string; // 'all' or category name / slug
  onSelectCategory: (category: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 px-1 flex items-center gap-2">
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
          selectedCategory === 'all'
            ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
            : 'bg-[#121520] hover:bg-[#181d2c] text-slate-300 border-slate-800 hover:border-slate-700'
        }`}
      >
        All
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase() || selectedCategory === cat.slug;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.name)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              isSelected
                ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-[#121520] hover:bg-[#181d2c] text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};
