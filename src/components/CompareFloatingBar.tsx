import React from 'react';
import { useCompare } from '../context/CompareContext';
import { X, ArrowRight, Layers, Trash2 } from 'lucide-react';

interface CompareFloatingBarProps {
  onNavigateToCompare: () => void;
}

export const CompareFloatingBar: React.FC<CompareFloatingBarProps> = ({ onNavigateToCompare }) => {
  const { compareList, removeFromCompare, clearCompare, isCompareBarOpen, setIsCompareBarOpen } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <div
      id="compare-floating-bar"
      className={`fixed bottom-0 left-0 right-0 z-40 p-4 transition-transform duration-300 ${
        isCompareBarOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="max-w-5xl mx-auto bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl shadow-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-sm flex items-center gap-2">
              <span>Product Comparison</span>
              <span className="px-2 py-0.5 text-xs bg-indigo-500 rounded-full font-bold">
                {compareList.length}/4
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {compareList.length < 2
                ? 'Select at least 1 more product to compare'
                : 'Ready to compare specs, prices & AI ratings'}
            </p>
          </div>
        </div>

        {/* Selected Products Thumbnails */}
        <div className="flex items-center gap-3 overflow-x-auto max-w-full py-1">
          {compareList.map((p) => (
            <div
              key={p.id}
              className="relative flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl p-1.5 pr-3 shrink-0"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-9 h-9 rounded-lg object-cover bg-slate-900"
                referrerPolicy="no-referrer"
              />
              <div className="text-left max-w-[120px]">
                <div className="text-xs font-medium truncate">{p.name}</div>
                <div className="text-[11px] text-indigo-400 font-semibold">
                  ₹{p.priceINR.toLocaleString('en-IN')}
                </div>
              </div>
              <button
                onClick={() => removeFromCompare(p.id)}
                className="w-5 h-5 rounded-full bg-slate-700 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors ml-1"
                aria-label={`Remove ${p.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Placeholders up to 4 */}
          {Array.from({ length: 4 - compareList.length }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="hidden lg:flex items-center justify-center w-28 h-12 rounded-xl border border-dashed border-slate-700 text-slate-500 text-xs text-center"
            >
              + Slot {compareList.length + idx + 1}
            </div>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={clearCompare}
            className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>

          <button
            id="compare-now-btn"
            disabled={compareList.length < 2}
            onClick={onNavigateToCompare}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              compareList.length >= 2
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Compare Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
