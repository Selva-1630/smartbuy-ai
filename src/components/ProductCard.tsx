import React, { useState } from 'react';
import { Product } from '../types';
import { ScoreBadge } from './ScoreBadge';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Star, Heart, ArrowRight, Check, Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  isFavorited?: boolean;
  onFavoriteChange?: (productId: string, isFav: boolean) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  isFavorited = false,
  onFavoriteChange,
}) => {
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const { showToast } = useToast();
  const [favorited, setFavorited] = useState(isFavorited);
  const [isFavLoading, setIsFavLoading] = useState(false);

  const inCompare = isInCompare(product.id);

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(product.id);
      showToast('info', `Removed ${product.name} from comparison.`);
    } else {
      const added = addToCompare(product);
      if (added) {
        showToast('success', `Added ${product.name} to comparison.`);
      } else {
        showToast('error', 'You can compare up to 4 products at a time.');
      }
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavLoading) return;
    setIsFavLoading(true);

    try {
      if (favorited) {
        await api.removeFavorite(product.id);
        setFavorited(false);
        onFavoriteChange?.(product.id, false);
        showToast('info', `Removed from saved favorites.`);
      } else {
        await api.addFavorite(product.id);
        setFavorited(true);
        onFavoriteChange?.(product.id, true);
        showToast('success', `Added to saved favorites.`);
      }
    } catch {
      // Toggle locally gracefully
      setFavorited(!favorited);
    } finally {
      setIsFavLoading(false);
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onSelect?.(product)}
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800/60 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-md bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur-xs shadow-xs">
            {product.category}
          </span>
          {product.isTrending && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-500 text-slate-950 shadow-xs">
              Trending
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-indigo-600 text-white shadow-xs">
              Best Seller
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          id={`fav-btn-${product.id}`}
          onClick={handleToggleFavorite}
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md z-10 ${
            favorited
              ? 'bg-rose-500 text-white'
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-rose-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-4.5 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            {product.brand}
          </div>

          <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {product.name}
          </h3>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-xs text-slate-900 dark:text-white">{product.rating}</span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ({product.reviewCount.toLocaleString()} reviews)
            </span>
          </div>

          {/* Value Score Pill */}
          <div className="mt-3">
            <ScoreBadge score={product.valueScore} label="Value for Money" size="sm" />
          </div>
        </div>

        {/* Price & Actions Bottom Section */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                ₹{product.priceINR.toLocaleString('en-IN')}
              </span>
              {product.originalPriceINR > product.priceINR && (
                <span className="text-xs text-slate-400 line-through ml-2">
                  ₹{product.originalPriceINR.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              ${product.priceUSD} USD
            </span>
          </div>

          {/* Interactive Button Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              id={`compare-toggle-${product.id}`}
              onClick={handleToggleCompare}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                inCompare
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-300'
                  : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
              }`}
            >
              {inCompare ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {inCompare ? 'Compared' : 'Compare'}
            </button>

            <button
              id={`details-btn-${product.id}`}
              onClick={() => onSelect?.(product)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white dark:hover:text-slate-950 transition-all shadow-xs"
            >
              Details
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
