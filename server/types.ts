export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  avatar?: string;
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

export interface SentimentAnalysisResult {
  overallScore: number; // 0 to 100
  sentimentLabel: 'Very Positive' | 'Positive' | 'Mixed' | 'Negative' | 'Very Negative';
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
  positiveHighlights: string[];
  negativeConcerns: string[];
  confidence: number; // 0 to 100
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
  valueScore: number; // 0 to 100
  specs: Record<string, string>;
  features: string[];
  pros: string[];
  cons: string[];
  summary: string;
  aiVerdict?: string;
  sentimentSummary: SentimentAnalysisResult;
  createdAt: string;
}

export interface RecommendationWeights {
  ratingWeight: number; // default 0.30
  valueForMoneyWeight: number; // default 0.25
  featureMatchWeight: number; // default 0.20
  reviewSentimentWeight: number; // default 0.15
  userRequirementMatchWeight: number; // default 0.10
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

export interface RecommendationRequest {
  query?: string;
  category?: string;
  maxBudgetINR?: number;
  minBudgetINR?: number;
  usagePurpose?: string; // e.g., "coding", "gaming", "college", "office", "photography", "commute", "fitness"
  priorityFeature?: string; // e.g., "battery", "performance", "display", "camera", "sound", "lightweight"
  weights?: Partial<RecommendationWeights>;
  excludeProductIds?: string[];
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

export interface FavoriteItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface SearchHistoryItem {
  id: string;
  userId?: string;
  query: string;
  category?: string;
  resultsCount: number;
  createdAt: string;
}

export interface ComparisonHistoryItem {
  id: string;
  userId?: string;
  productIds: string[];
  products: Product[];
  winnerId?: string;
  createdAt: string;
}
