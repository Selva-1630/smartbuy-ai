import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  isCompareBarOpen: boolean;
  setIsCompareBarOpen: (open: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('smartbuy_compare_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCompareBarOpen, setIsCompareBarOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('smartbuy_compare_list', JSON.stringify(compareList));
    } catch (e) {
      console.warn('Failed to persist compare list', e);
    }
  }, [compareList]);

  const addToCompare = (product: Product): boolean => {
    if (compareList.some((p) => p.id === product.id)) {
      return false;
    }
    if (compareList.length >= 4) {
      return false; // limit reached
    }
    setCompareList((prev) => [...prev, product]);
    setIsCompareBarOpen(true);
    return true;
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
    setIsCompareBarOpen(false);
  };

  const isInCompare = (productId: string): boolean => {
    return compareList.some((p) => p.id === productId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isCompareBarOpen,
        setIsCompareBarOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
