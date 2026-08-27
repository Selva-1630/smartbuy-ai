import React, { useState, useEffect } from 'react';
import { Product, CategoryInfo } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  Sliders,
  CheckCircle2,
  ShieldAlert,
  Search,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: any, extra?: any) => void;
  onOpenWeightConfig: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenWeightConfig }) => {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [bestValueProducts, setBestValueProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [naturalQuery, setNaturalQuery] = useState('');

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [cats, prods] = await Promise.all([
          api.getCategories(),
          api.getProducts({ limit: 12 }),
        ]);
        setCategories(cats);

        const list = prods.products;
        setTrendingProducts(list.filter((p) => p.isTrending).slice(0, 4));
        setBestValueProducts(
          [...list].sort((a, b) => b.valueScore - a.valueScore).slice(0, 4)
        );
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalQuery.trim()) return;
    onNavigate('assistant', { initialQuery: naturalQuery.trim() });
  };

  const samplePrompts = [
    'Best laptop under ₹60,000 for coding',
    'Best camera phone under 40k',
    'Noise-cancelling headphones for travel',
    'Smart watch with long battery life',
    'Best 4K monitor for work',
  ];

  const productPriceAlert = [...trendingProducts, ...bestValueProducts][0];
  const priceAlertTier = productPriceAlert
    ? productPriceAlert.priceINR < 80000
      ? 'low'
      : productPriceAlert.priceINR < 120000
        ? 'medium'
        : 'high'
    : 'medium';

  const priceAlertContent =
    priceAlertTier === 'low'
      ? {
          title: 'Low price alert',
          description: 'This product is currently in the low-price window. It is a smart time to buy before values rise.',
          badge: 'Best value',
        }
      : priceAlertTier === 'medium'
        ? {
            title: 'Medium price alert',
            description: 'This product is in the normal pricing band. It is still a balanced buy with a fair market value.',
            badge: 'Fair price',
          }
        : {
            title: 'High price alert',
            description: 'This product is in the premium price band, so a complimentary free product is added with the order.',
            badge: 'Premium bundle',
          };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Multi-Weighted AI Shopping Assistant</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Stop Guessing. Discover the <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">
              Best Value For Your Money.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Unbiased algorithmic scoring combining customer ratings, price-to-performance ratio, verified review sentiment, and your exact requirements.
          </p>

          {/* Interactive Natural Language Search Form */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-2xl mx-auto bg-slate-800/90 border border-slate-700/80 p-2 sm:p-2.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 transition-all focus-within:border-indigo-500"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
              <input
                id="hero-ai-search-input"
                type="text"
                value={naturalQuery}
                onChange={(e) => setNaturalQuery(e.target.value)}
                placeholder="Ask anything: e.g. Best laptop for college under ₹60k..."
                className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-hidden"
              />
            </div>
            <button
              id="hero-ai-submit-btn"
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Ask Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-400 font-medium">Try asking:</span>
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate('assistant', { initialQuery: prompt })}
                className="text-xs px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {productPriceAlert && (
          <section className="pt-8">
            <div
              className={`rounded-2xl border p-4 sm:p-5 ${
                priceAlertTier === 'high'
                  ? 'border-amber-500/40 bg-amber-500/10'
                  : priceAlertTier === 'medium'
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : 'border-indigo-500/40 bg-indigo-500/10'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Price monitor
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {priceAlertContent.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {priceAlertContent.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-current" />
                  {priceAlertContent.badge}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. CATEGORIES GRID */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Explore by Category
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Curated catalogs with verified price comparisons
              </p>
            </div>
            <button
              onClick={() => onNavigate('search')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.name}
                id={`cat-card-${cat.name}`}
                onClick={() => onNavigate('search', { category: cat.name })}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 text-center cursor-pointer transition-all hover:shadow-lg flex flex-col items-center justify-between overflow-hidden"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-10 h-10 object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {cat.count} items · from ₹{(cat.minPrice / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. TRENDING PICKS */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Trending Recommendations
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Popular consumer electronics evaluated by our algorithm
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('search', { sortBy: 'rating' })}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Explore more</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(p) => onNavigate('product', { productId: p.id })}
              />
            ))}
          </div>
        </section>

        {/* 4. VALUE FOR MONEY CHAMPIONS */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Best Value-for-Money Index
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Highest specification and performance return per rupee spent
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('search', { sortBy: 'value-desc' })}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View all value picks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestValueProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(p) => onNavigate('product', { productId: p.id })}
              />
            ))}
          </div>
        </section>

        {/* 5. HOW IT WORKS / ALGORITHM TRANSPARENCY BANNER */}
        <section className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 relative overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Transparent Decision Architecture</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              How SmartBuy AI Calculates Recommendations
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Unlike retail websites driven by sponsored placements, SmartBuy AI evaluates candidates purely mathematically using five distinct weighted criteria.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
                <div className="text-xl font-extrabold text-indigo-400">30%</div>
                <div className="text-xs font-medium text-slate-300 mt-1">Customer Rating</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
                <div className="text-xl font-extrabold text-emerald-400">25%</div>
                <div className="text-xs font-medium text-slate-300 mt-1">Value for Money</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
                <div className="text-xl font-extrabold text-sky-400">20%</div>
                <div className="text-xs font-medium text-slate-300 mt-1">Feature Match</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
                <div className="text-xl font-extrabold text-amber-400">15%</div>
                <div className="text-xs font-medium text-slate-300 mt-1">Review Sentiment</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
                <div className="text-xl font-extrabold text-rose-400">10%</div>
                <div className="text-xs font-medium text-slate-300 mt-1">User Intent</div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenWeightConfig}
                className="px-4 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Customize Algorithm Weights</span>
              </button>

              <button
                onClick={() => onNavigate('test-suite')}
                className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition-colors border border-slate-700"
              >
                Run Automated System Tests
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
