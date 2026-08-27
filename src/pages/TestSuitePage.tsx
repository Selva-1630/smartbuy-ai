import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Activity,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  RotateCcw,
  Code2,
} from 'lucide-react';

interface TestItem {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  details?: string;
  error?: string;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  allPassed: boolean;
  durationMs: number;
  timestamp: string;
}

export const TestSuitePage: React.FC = () => {
  const [summary, setSummary] = useState<TestSummary | null>(null);
  const [results, setResults] = useState<TestItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const res = await api.runTestSuite();
      setSummary(res.summary);
      setResults(res.results);
    } catch (err: any) {
      console.error('Test run failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Auto-run once on view
    runTests();
  }, []);

  const getSuiteIcon = (suite: string) => {
    switch (suite) {
      case 'Authentication':
        return <ShieldCheck className="w-4 h-4 text-sky-500" />;
      case 'Product Catalog & Search':
        return <Layers className="w-4 h-4 text-indigo-500" />;
      case 'Product Comparison':
        return <Activity className="w-4 h-4 text-amber-500" />;
      case 'Recommendation Engine':
        return <Cpu className="w-4 h-4 text-emerald-500" />;
      case 'Review Intelligence':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <Code2 className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-emerald-500" />
            <span>Automated System Test Suite</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time verification of backend APIs, authentication, scoring algorithms, and sentiment models
          </p>
        </div>

        <button
          id="run-tests-btn"
          onClick={runTests}
          disabled={isRunning}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          {isRunning ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>{isRunning ? 'Executing Test Runners...' : 'Run All Tests'}</span>
        </button>
      </div>

      {/* Summary Stats Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Status */}
          <div
            className={`p-4 rounded-2xl border ${
              summary.allPassed
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30'
                : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/30'
            }`}
          >
            <div className="text-xs font-semibold text-slate-500">Overall Suite Status</div>
            <div
              className={`text-xl font-extrabold mt-1 flex items-center gap-1.5 ${
                summary.allPassed
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {summary.allPassed ? (
                <>
                  <CheckCircle2 className="w-5 h-5" /> ALL PASSED
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" /> FAILURES DETECTED
                </>
              )}
            </div>
          </div>

          {/* Passed Tests */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500">Passed Tests</div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {summary.passed} / {summary.total}
            </div>
          </div>

          {/* Failed Tests */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500">Failed Tests</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {summary.failed}
            </div>
          </div>

          {/* Duration */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500">Execution Time</div>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{summary.durationMs}ms</span>
            </div>
          </div>
        </div>
      )}

      {/* Test Results Breakdown */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Detailed Test Cases & Verification Outputs
        </h3>

        <div className="space-y-3">
          {results.map((test, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                test.passed
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  {test.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      {getSuiteIcon(test.suite)}
                      <span>{test.suite}</span>
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {test.name}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs self-end sm:self-auto">
                  <span className="font-semibold text-slate-400">{test.durationMs}ms</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      test.passed
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {test.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>

              {test.details && (
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl mt-2 font-mono leading-relaxed">
                  {test.details}
                </div>
              )}

              {test.error && (
                <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-100/50 dark:bg-rose-950/40 p-2.5 rounded-xl mt-2 font-mono">
                  Error: {test.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
