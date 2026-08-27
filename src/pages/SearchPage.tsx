import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface SearchPageProps {
  initialSearch?: string;
  initialCategory?: string;
  initialSortBy?: string;
  onNavigate: (page: any, extra?: any) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialSearch = '',
  initialCategory = 'All',
  initialSortBy = 'rating',
  onNavigate,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number>(250000);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Available brands in database
  const brands = [
    'All',
    'Apple',
    'Samsung',
    'OnePlus',
    'Sony',
    'Bose',
    'Dell',
    'Lenovo',
    'ASUS',
    'Garmin',
    'LG',
  ];

  const categories = [
    'All',
    'Smartphones',
    'Laptops',
    'Headphones',
    'Smart Watches',
    'Tablets',
    'Monitors',
  ];

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    async function fetchCatalog() {
      setLoading(true);
      try {
        const res = await api.getProducts({
          category: category !== 'All' ? category : undefined,
          brand: brand !== 'All' ? brand : undefined,
          maxPrice,
          search: search.trim() ? search.trim() : undefined,
          sortBy,
          limit: 50,
        });
        setProducts(res.products);
        setTotalCount(res.total);
      } catch (err) {
        console.error('Failed to fetch catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, [category, brand, maxPrice, search, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setBrand('All');
    setMaxPrice(250000);
    setSortBy('rating');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Product Catalog & Search
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare prices, specifications, and AI value ratings across verified models
          </p>
        </div>

        {/* Ask AI shortcut */}
        <button
          onClick={() => onNavigate('assistant', { initialQuery: search || category !== 'All' ? `Best ${category}` : 'Top recommendations' })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors shrink-0"
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Ask AI to recommend in this category</span>
        </button>
      </div>

      {/* Main Search Bar */}
      <div className="relative">
        <input
          id="search-page-input"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by keyword, model, feature (e.g. OLED, RTX 4070, 5000mAh, ANC)..."
          className="w-full pl-11 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white absolute right-3 top-1/2 -translate-y-1/2"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            id={`filter-cat-${cat}`}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Secondary Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Brand selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Brand:</span>
          <select
            id="brand-filter-select"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
          >
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Max Budget Slider */}
        <div className="flex items-center gap-3 min-w-[220px]">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Max Budget:</span>
          <input
            id="budget-filter-slider"
            type="range"
            min="10000"
            max="250000"
            step="5000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-28 sm:w-36 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            ₹{(maxPrice / 1000).toFixed(0)}k
          </span>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sort:</span>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="rating">Top Rated (Highest First)</option>
            <option value="value-desc">Best Value for Money</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* Reset */}
        {(category !== 'All' || brand !== 'All' || maxPrice < 250000 || search || sortBy !== 'rating') && (
          <button
            onClick={handleResetFilters}
            className="text-xs text-slate-500 hover:text-rose-500 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-900 dark:text-white">{products.length}</strong> of{' '}
          {totalCount} products
        </span>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 animate-pulse"
            >
              <div className="aspect-4/3 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => onNavigate('product', { productId: p.id })}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No products match your active filters
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your budget limit or broadening your category/brand selection.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
