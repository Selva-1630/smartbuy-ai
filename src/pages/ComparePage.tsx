import React, { useState, useEffect } from 'react';
import { Product, ComparisonHighlights } from '../types';
import { api } from '../services/api';
import { useCompare } from '../context/CompareContext';
import { ScoreBadge } from '../components/ScoreBadge';
import {
  Layers,
  Star,
  Trash2,
  Plus,
  ArrowRight,
  Sparkles,
  Trophy,
  Check,
  X,
} from 'lucide-react';

interface ComparePageProps {
  onNavigate: (page: any, extra?: any) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({ onNavigate }) => {
  const { compareList, removeFromCompare, clearCompare, addToCompare } = useCompare();

  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [specKeys, setSpecKeys] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<ComparisonHighlights | null>(null);
  const [loading, setLoading] = useState(false);

  // Add Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [modalSearch, setModalSearch] = useState('');

  useEffect(() => {
    async function runComparison() {
      if (compareList.length < 2) {
        setComparedProducts(compareList);
        setHighlights(null);
        return;
      }

      setLoading(true);
      try {
        const res = await api.compareProducts(compareList.map((p) => p.id));
        setComparedProducts(res.products);
        setSpecKeys(res.specKeys);
        setHighlights(res.highlights);
      } catch (err) {
        console.error('Comparison error:', err);
      } finally {
        setLoading(false);
      }
    }
    runComparison();
  }, [compareList]);

  // Load catalog for picker modal
  const openAddModal = async () => {
    setIsAddModalOpen(true);
    try {
      const res = await api.getProducts({ limit: 50 });
      setCatalogProducts(res.products);
    } catch {
      // ignore
    }
  };

  const handleSelectModalProduct = (product: Product) => {
    addToCompare(product);
    setIsAddModalOpen(false);
  };

  const filteredCatalog = catalogProducts.filter((p) => {
    if (compareList.some((cp) => cp.id === p.id)) return false;
    if (!modalSearch.trim()) return true;
    return `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(modalSearch.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Product Comparison Matrix</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Evaluate specifications, verified ratings, and value scores side-by-side
          </p>
        </div>

        {compareList.length > 0 && (
          <div className="flex items-center gap-2.5">
            {compareList.length < 4 && (
              <button
                id="add-compare-slot-btn"
                onClick={openAddModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product ({compareList.length}/4)</span>
              </button>
            )}
            <button
              onClick={clearCompare}
              className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:border-rose-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {compareList.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            No products selected for comparison
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Browse our catalog or use the AI Assistant to select up to 4 products and compare specs, prices, and AI scores side-by-side.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('search')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={openAddModal}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Pick from Quick Selector
            </button>
          </div>
        </div>
      ) : compareList.length === 1 ? (
        /* 1 Product State */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold">
            You currently have 1 product selected: <strong>{compareList[0].name}</strong>
          </p>
          <p className="text-xs text-slate-500">
            Please add at least 1 more product to generate the comparison matrix.
          </p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Select Second Product</span>
          </button>
        </div>
      ) : (
        /* Comparison Table and Highlights */
        <div className="space-y-8">
          {/* Winner Highlights Banner */}
          {highlights && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Best Overall */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Best Overall</span>
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {highlights.bestOverall.name}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  {highlights.bestOverall.reason}
                </p>
              </div>

              {/* Best Value */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Best Value</span>
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {highlights.bestValue.name}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  {highlights.bestValue.reason}
                </p>
              </div>

              {/* Best Rated */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-slate-900 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>Best Rated</span>
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {highlights.bestRated.name}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  {highlights.bestRated.reason}
                </p>
              </div>

              {/* Budget Choice */}
              <div className="bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/40 dark:to-slate-900 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                  <span className="font-extrabold text-sm">₹</span>
                  <span>Budget Choice</span>
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {highlights.budgetChoice.name}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  {highlights.budgetChoice.reason}
                </p>
              </div>
            </div>
          )}

          {/* Matrix Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                {/* Header Row: Products Overview */}
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <th className="p-4 sm:p-6 w-1/5 min-w-[140px] text-xs font-bold uppercase text-slate-400">
                      Product
                    </th>
                    {comparedProducts.map((prod) => (
                      <th
                        key={prod.id}
                        className="p-4 sm:p-6 min-w-[200px] align-top text-slate-900 dark:text-white border-l border-slate-200 dark:border-slate-800"
                      >
                        <div className="space-y-3">
                          {/* Image & Remove */}
                          <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              onClick={() => removeFromCompare(prod.id)}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-white hover:bg-rose-600 transition-colors"
                              aria-label={`Remove ${prod.name}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div>
                            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                              {prod.brand}
                            </div>
                            <h4 className="font-bold text-xs sm:text-sm line-clamp-2 mt-0.5">
                              {prod.name}
                            </h4>
                          </div>

                          <div className="flex items-baseline justify-between pt-1">
                            <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                              ₹{prod.priceINR.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-slate-400">${prod.priceUSD} USD</span>
                          </div>

                          <button
                            onClick={() => onNavigate('product', { productId: prod.id })}
                            className="w-full py-2 px-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span>Full Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                  {/* Rating row */}
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                      Customer Rating
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-4 sm:p-5 border-l border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-slate-900 dark:text-white">{p.rating}</span>
                          <span className="text-xs text-slate-400">
                            ({p.reviewCount.toLocaleString()})
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Value Score row */}
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                      Value Score
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-4 sm:p-5 border-l border-slate-100 dark:border-slate-800">
                        <ScoreBadge score={p.valueScore} label="Value" size="sm" />
                      </td>
                    ))}
                  </tr>

                  {/* Sentiment Score row */}
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                      Review Sentiment
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-4 sm:p-5 border-l border-slate-100 dark:border-slate-800">
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {p.sentimentSummary?.sentimentLabel || 'Positive'} (
                            {p.sentimentSummary?.overallScore || 85}/100)
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {p.sentimentSummary?.positivePercentage || 80}% Positive
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Key Pros */}
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 align-top">
                      Top Strengths
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-4 sm:p-5 border-l border-slate-100 dark:border-slate-800 align-top">
                        <ul className="space-y-1 text-xs">
                          {p.pros.slice(0, 3).map((pro, i) => (
                            <li key={i} className="text-emerald-700 dark:text-emerald-400 flex items-start gap-1">
                              <span className="font-bold">✓</span> {pro}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  {/* Key Cons */}
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 align-top">
                      Tradeoffs
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-4 sm:p-5 border-l border-slate-100 dark:border-slate-800 align-top">
                        <ul className="space-y-1 text-xs">
                          {p.cons.slice(0, 2).map((con, i) => (
                            <li key={i} className="text-rose-600 dark:text-rose-400 flex items-start gap-1">
                              <span className="font-bold">✗</span> {con}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  {/* Dynamic Technical Specs Rows */}
                  {specKeys.map((key) => (
                    <tr key={key}>
                      <td className="p-4 sm:p-5 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </td>
                      {comparedProducts.map((p) => (
                        <td
                          key={p.id}
                          className="p-4 sm:p-5 border-l border-slate-100 dark:border-slate-800 font-medium text-slate-900 dark:text-white"
                        >
                          {p.specs?.[key] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Select Product to Compare
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Filter by name, category, or brand..."
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
            />

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCatalog.map((p) => (
                <div
                  key={p.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-12 h-12 object-cover rounded-xl bg-slate-100 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.category} · ₹{p.priceINR.toLocaleString('en-IN')} · {p.rating}★
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectModalProduct(p)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shrink-0"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
