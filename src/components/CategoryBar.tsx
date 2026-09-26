import React, { memo } from 'react';
import { Category } from '../types';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string; // 'all' or category name / slug
  onSelectCategory: (category: string) => void;
}

const CategoryBarComponent: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 px-1 flex items-center gap-2">
      <button
        type="button"
        onClick={() => onSelectCategory('all')}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border cursor-pointer ${
          selectedCategory === 'all'
            ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
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
            type="button"
            onClick={() => onSelectCategory(cat.name)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border cursor-pointer ${
              isSelected
                ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
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

export const CategoryBar = memo(CategoryBarComponent);

