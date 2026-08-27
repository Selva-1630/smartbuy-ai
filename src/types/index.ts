export interface SentimentAnalysisResult {
  overallScore: number;
  sentimentLabel: 'Very Positive' | 'Positive' | 'Mixed' | 'Negative' | 'Very Negative';
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
  positiveHighlights: string[];
  negativeConcerns: string[];
  confidence: number;
  totalReviewsAnalyzed: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'Smartphones' | 'Laptops' | 'Headphones' | 'Smart Watches' | 'Tablets' | 'Monitors';
  priceINR: number;
  priceUSD: number;
  originalPriceINR: number;
  rating: number;
  reviewCount: number;
  image: string;
  galleryImages: string[];
  inStock: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  valueScore: number;
  specs: Record<string, string>;
  features: string[];
  pros: string[];
  cons: string[];
  summary: string;
  aiVerdict?: string;
  sentimentSummary: SentimentAnalysisResult;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  sentiment?: 'positive' | 'neutral' | 'negative';
  helpfulCount: number;
}

export interface RecommendationWeights {
  ratingWeight: number;
  valueForMoneyWeight: number;
  featureMatchWeight: number;
  reviewSentimentWeight: number;
  userRequirementMatchWeight: number;
}

export interface ScoredProduct extends Product {
  overallScore: number;
  scoreBreakdown: {
    ratingScore: number;
    valueForMoneyScore: number;
    featureMatchScore: number;
    sentimentScore: number;
    requirementMatchScore: number;
  };
  matchReason: string;
  keyStrengths: string[];
  keyWeaknesses: string[];
  badge?: 'Best Overall' | 'Best Value' | 'Best Rated' | 'Budget Choice' | 'Top Match';
}

export interface RecommendationResponse {
  analysis: {
    detectedCategory?: string;
    detectedBudgetINR?: number;
    detectedUsage?: string;
    detectedPriorities: string[];
    aiPowered: boolean;
    provider: 'gemini' | 'local-engine';
    summary: string;
  };
  recommendedProducts: ScoredProduct[];
  topPick: ScoredProduct | null;
  alternatives: ScoredProduct[];
  weightsUsed: RecommendationWeights;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface CategoryInfo {
  name: string;
  count: number;
  minPrice: number;
  maxPrice: number;
  icon: string;
  image: string;
}

export interface ComparisonHighlights {
  bestOverall: { id: string; name: string; reason: string };
  bestValue: { id: string; name: string; reason: string };
  bestRated: { id: string; name: string; reason: string };
  budgetChoice: { id: string; name: string; reason: string };
}
