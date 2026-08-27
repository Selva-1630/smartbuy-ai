import React, { useState, useEffect } from 'react';
import { FavoriteItem } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Heart, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface FavoritesPageProps {
  onNavigate: (page: any, extra?: any) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const res = await api.getFavorites();
        setFavorites(res);
      } catch (err) {
        console.error('Failed to load favorites:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, []);

  const handleFavoriteChange = (productId: string, isFav: boolean) => {
    if (!isFav) {
      setFavorites((prev) => prev.filter((f) => f.productId !== productId));
    }
  };

  const totalPrice = favorites.reduce((sum, f) => sum + (f.product?.priceINR || 0), 0);
  const totalSavings = favorites.reduce(
    (sum, f) => sum + Math.max(0, (f.product?.originalPriceINR || 0) - (f.product?.priceINR || 0)),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            <span>Saved Favorites & Shortlist</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track saved products, compare value scores, and calculate total budget
          </p>
        </div>

        {favorites.length > 0 && (
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Total Shortlist Value
              </span>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            {totalSavings > 0 && (
              <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Catalog Savings
                </span>
                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                  ₹{totalSavings.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading your shortlist...</div>
      ) : favorites.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-slate-800 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Your shortlist is currently empty
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click the heart icon on any product in the catalog or assistant recommendations to save items here.
          </p>
          <button
            onClick={() => onNavigate('search')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Products</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favorites.map((fav) =>
            fav.product ? (
              <ProductCard
                key={fav.id}
                product={fav.product}
                isFavorited={true}
                onFavoriteChange={handleFavoriteChange}
                onSelect={(p) => onNavigate('product', { productId: p.id })}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
};
