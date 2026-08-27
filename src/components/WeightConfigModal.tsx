import React, { useState, useEffect } from 'react';
import { RecommendationWeights } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { X, Sliders, RotateCcw, Check, Sparkles } from 'lucide-react';

interface WeightConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWeightsUpdated?: (weights: RecommendationWeights) => void;
}

export const WeightConfigModal: React.FC<WeightConfigModalProps> = ({
  isOpen,
  onClose,
  onWeightsUpdated,
}) => {
  const { showToast } = useToast();
  const [weights, setWeights] = useState<RecommendationWeights>({
    ratingWeight: 0.30,
    valueForMoneyWeight: 0.25,
    featureMatchWeight: 0.20,
    reviewSentimentWeight: 0.15,
    userRequirementMatchWeight: 0.10,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getWeights().then((w) => setWeights(w)).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalSum = Math.round(
    (weights.ratingWeight +
      weights.valueForMoneyWeight +
      weights.featureMatchWeight +
      weights.reviewSentimentWeight +
      weights.userRequirementMatchWeight) *
      100
  );

  const handleSliderChange = (key: keyof RecommendationWeights, valPercent: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: valPercent / 100,
    }));
  };

  const handleReset = () => {
    setWeights({
      ratingWeight: 0.30,
      valueForMoneyWeight: 0.25,
      featureMatchWeight: 0.20,
      reviewSentimentWeight: 0.15,
      userRequirementMatchWeight: 0.10,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await api.updateWeights(weights);
      onWeightsUpdated?.(updated);
      showToast('success', 'Recommendation algorithm weights updated.');
      onClose();
    } catch {
      showToast('error', 'Failed to update weights.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        id="weight-config-modal"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recommendation Algorithm Weights
            </h3>
            <p className="text-xs text-slate-500">
              Customize how SmartBuy AI scores and prioritizes candidates
            </p>
          </div>
        </div>

        {/* Total Weight Status */}
        <div className="mb-6 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            Active Factor Distribution (Normalized):
          </span>
          <span className={`font-bold ${totalSum === 100 ? 'text-emerald-500' : 'text-indigo-400'}`}>
            Total Weight: {totalSum}%
          </span>
        </div>

        {/* Sliders */}
        <div className="space-y-4 mb-6">
          {/* 1. Rating */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Customer Rating Score</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {Math.round(weights.ratingWeight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={Math.round(weights.ratingWeight * 100)}
              onChange={(e) => handleSliderChange('ratingWeight', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* 2. Value for Money */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Value for Money Index</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {Math.round(weights.valueForMoneyWeight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={Math.round(weights.valueForMoneyWeight * 100)}
              onChange={(e) => handleSliderChange('valueForMoneyWeight', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* 3. Feature Match */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Feature & Specification Match</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {Math.round(weights.featureMatchWeight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={Math.round(weights.featureMatchWeight * 100)}
              onChange={(e) => handleSliderChange('featureMatchWeight', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* 4. Review Sentiment */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Review Sentiment Intelligence</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {Math.round(weights.reviewSentimentWeight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={Math.round(weights.reviewSentimentWeight * 100)}
              onChange={(e) => handleSliderChange('reviewSentimentWeight', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* 5. User Requirement Match */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Intent & Budget Leeway Match</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {Math.round(weights.userRequirementMatchWeight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={Math.round(weights.userRequirementMatchWeight * 100)}
              onChange={(e) => handleSliderChange('userRequirementMatchWeight', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Apply Weights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
