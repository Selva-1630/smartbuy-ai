import React from 'react';
import { SentimentAnalysisResult } from '../types';
import { ThumbsUp, ThumbsDown, Sparkles, ShieldCheck } from 'lucide-react';

interface SentimentChartProps {
  sentiment: SentimentAnalysisResult;
  showDetails?: boolean;
}

export const SentimentChart: React.FC<SentimentChartProps> = ({ sentiment, showDetails = true }) => {
  const {
    overallScore,
    sentimentLabel,
    positivePercentage,
    neutralPercentage,
    negativePercentage,
    positiveHighlights = [],
    negativeConcerns = [],
    confidence,
  } = sentiment;

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h4 className="font-semibold text-slate-900 dark:text-white text-base">Review Intelligence & Sentiment</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium">
            {sentimentLabel} ({overallScore}/100)
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400" title="Review Confidence Score">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            {confidence}% Confidence
          </span>
        </div>
      </div>

      {/* Multi-segment Sentiment Bar */}
      <div className="space-y-1.5 mb-5">
        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{positivePercentage}% Positive</span>
          <span className="text-slate-500">{neutralPercentage}% Neutral</span>
          <span className="text-rose-600 dark:text-rose-400 font-semibold">{negativePercentage}% Negative</span>
        </div>
        <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${positivePercentage}%` }}
            className="bg-emerald-500 h-full transition-all duration-500"
            title={`Positive: ${positivePercentage}%`}
          />
          <div
            style={{ width: `${neutralPercentage}%` }}
            className="bg-slate-400 dark:bg-slate-600 h-full transition-all duration-500"
            title={`Neutral: ${neutralPercentage}%`}
          />
          <div
            style={{ width: `${negativePercentage}%` }}
            className="bg-rose-500 h-full transition-all duration-500"
            title={`Negative: ${negativePercentage}%`}
          />
        </div>
      </div>

      {/* Highlights & Concerns Grid */}
      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Positive Highlights */}
          <div className="bg-white dark:bg-slate-800/80 border border-emerald-500/20 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2.5">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>COMMONLY PRAISED HIGHLIGHTS</span>
            </div>
            {positiveHighlights.length > 0 ? (
              <ul className="space-y-1.5">
                {positiveHighlights.map((highlight, idx) => (
                  <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">No specific positive highlights isolated yet.</p>
            )}
          </div>

          {/* Negative Concerns */}
          <div className="bg-white dark:bg-slate-800/80 border border-rose-500/20 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400 mb-2.5">
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>CRITICAL USER CONCERNS</span>
            </div>
            {negativeConcerns.length > 0 ? (
              <ul className="space-y-1.5">
                {negativeConcerns.map((concern, idx) => (
                  <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{concern}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">No recurring critical issues detected in verified buyer reviews.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
