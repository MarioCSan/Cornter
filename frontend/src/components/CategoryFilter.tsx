import { useState, useEffect } from 'react';
import { Category } from '../types/category';
import { categoryService } from '../services/api';

interface CategoryFilterProps {
  onCategoriesChange: (categoryIds: number[]) => void;
}

export function CategoryFilter({ onCategoriesChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const cats = await categoryService.getAll();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggle = (id: number) => {
    const newSelected = selected.includes(id)
      ? selected.filter(c => c !== id)
      : [...selected, id];
    setSelected(newSelected);
    onCategoriesChange(newSelected);
  };

  if (loading) return <div className="text-gray-400">Loading categories...</div>;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => handleToggle(cat.id)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selected.includes(cat.id)
              ? 'bg-blue-600 text-white'
              : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
