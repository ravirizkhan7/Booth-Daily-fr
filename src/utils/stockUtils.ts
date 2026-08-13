import { Product, Recipe, Stock } from '../types';

export interface ProductStockInfo {
  maxPortions: number;
  status: 'AMAN' | 'MENIPIS' | 'SISA_SEDIKIT' | 'HABIS';
  label: string;
  badgeColorClass: string;
  isOut: boolean;
}

export function getProductStockInfo(
  product: Product,
  recipes: Recipe[],
  stocks: Stock[]
): ProductStockInfo {
  // Find recipe for product
  const recipe = recipes.find(r => r.product_id === product.id);

  // If no recipe defined or recipe ingredients list is empty, default to available
  if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
    return {
      maxPortions: Infinity,
      status: 'AMAN',
      label: '🟢 Tersedia',
      badgeColorClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      isOut: false
    };
  }

  let minPortions = Infinity;
  let hasLowStockIngredient = false;

  for (const ing of recipe.ingredients) {
    const stockItem = stocks.find(s => s.id === ing.stock_id);
    if (!stockItem || stockItem.current_amount <= 0) {
      minPortions = 0;
      break;
    }

    if (ing.amount > 0) {
      const possible = Math.floor(stockItem.current_amount / ing.amount);
      if (possible < minPortions) {
        minPortions = possible;
      }
    }

    if (stockItem.current_amount <= stockItem.min_amount) {
      hasLowStockIngredient = true;
    }
  }

  if (minPortions === Infinity) {
    minPortions = 999;
  }

  if (minPortions <= 0) {
    return {
      maxPortions: 0,
      status: 'HABIS',
      label: 'Habis',
      badgeColorClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
      isOut: true
    };
  }

  if (minPortions <= 5) {
    return {
      maxPortions: minPortions,
      status: 'SISA_SEDIKIT',
      label: `🟠 Sisa ${minPortions}`,
      badgeColorClass: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30',
      isOut: false
    };
  }

  if (hasLowStockIngredient) {
    return {
      maxPortions: minPortions,
      status: 'MENIPIS',
      label: '🟡 Stok Menipis',
      badgeColorClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
      isOut: false
    };
  }

  return {
    maxPortions: minPortions,
    status: 'AMAN',
    label: '🟢 Tersedia',
    badgeColorClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    isOut: false
  };
}
