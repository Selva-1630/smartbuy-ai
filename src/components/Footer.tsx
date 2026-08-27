import React from 'react';
import { Sparkles, ShieldCheck, Cpu, Code2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: any, extra?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-base">SmartBuy AI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Intelligent, objective shopping assistant powered by multi-weighted decision algorithms, natural language understanding, and review sentiment intelligence. Built to help consumers find the best value for their budget.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Unbiased Scoring
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-medium">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Dual Engine (Gemini + Local NLP)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-medium">
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                100% Real Interactive APIs
              </span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider mb-3">
              Explore Categories
            </h4>
            <ul className="space-y-2">
              {['Smartphones', 'Laptops', 'Headphones', 'Smart Watches', 'Tablets', 'Monitors'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onNavigate('search', { category: cat })}
                    className="hover:text-white transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Intelligence Modules */}
          <div>
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider mb-3">
              Assistant Modules
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('assistant')} className="hover:text-white transition-colors">
                  Conversational Advisor
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('compare')} className="hover:text-white transition-colors">
                  Product Comparison Matrix
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('test-suite')} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  System Test Suite
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('favorites')} className="hover:text-white transition-colors">
                  Saved Shortlist
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} SmartBuy AI. All product prices and specifications are catalog references.
          </div>
          <div className="flex items-center gap-4">
            <span>Formula: 30% Rating + 25% Value + 20% Features + 15% Sentiment + 10% Intent</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
