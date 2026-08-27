import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CompareFloatingBar } from './components/CompareFloatingBar';
import { AuthModal } from './components/AuthModal';
import { WeightConfigModal } from './components/WeightConfigModal';

import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ComparePage } from './pages/ComparePage';
import { AssistantPage } from './pages/AssistantPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { TestSuitePage } from './pages/TestSuitePage';

type PageType = 'home' | 'search' | 'product' | 'compare' | 'assistant' | 'favorites' | 'test-suite';

function AppContent() {
  const { user, isLoading, openAuthModal } = useAuth();
  const [activePage, setActivePage] = useState<PageType>('home');
  const [pageParams, setPageParams] = useState<Record<string, any>>({});
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      openAuthModal('login');
    }
  }, [isLoading, user, openAuthModal]);

  const handleNavigate = (page: PageType, extra: Record<string, any> = {}) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setActivePage(page);
    setPageParams(extra);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-300">Loading SmartBuy AI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
        <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold">Login required</h1>
          <p className="mt-3 text-sm text-slate-300">
            Please sign in to access SmartBuy AI and view product pricing alerts.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Sign In
          </button>
        </div>
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Global Navigation */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenWeightConfig={() => setIsWeightModalOpen(true)}
      />

      {/* Page Router View */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenWeightConfig={() => setIsWeightModalOpen(true)}
          />
        )}

        {activePage === 'search' && (
          <SearchPage
            initialSearch={pageParams.search || ''}
            initialCategory={pageParams.category || 'All'}
            initialSortBy={pageParams.sortBy || 'rating'}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'product' && (
          <ProductDetailPage
            productId={pageParams.productId}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'compare' && (
          <ComparePage onNavigate={handleNavigate} />
        )}

        {activePage === 'assistant' && (
          <AssistantPage
            initialQuery={pageParams.initialQuery || ''}
            onNavigate={handleNavigate}
            onOpenWeightConfig={() => setIsWeightModalOpen(true)}
          />
        )}

        {activePage === 'favorites' && (
          <FavoritesPage onNavigate={handleNavigate} />
        )}

        {activePage === 'test-suite' && (
          <TestSuitePage />
        )}
      </main>

      {/* Global Modals & Floating Drawers */}
      <CompareFloatingBar
        onNavigateToCompare={() => handleNavigate('compare')}
      />
      <AuthModal />
      <WeightConfigModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
      />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CompareProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </CompareProvider>
    </AuthProvider>
  );
}

export default App;
