import {
  Product,
  Review,
  CategoryInfo,
  RecommendationResponse,
  RecommendationWeights,
  ComparisonHighlights,
  User,
  FavoriteItem,
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('smartbuy_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to sign in');
    return data;
  },

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create account');
    return data;
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Session expired');
    return data.user;
  },

  // Products
  async getProducts(params: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ total: number; page: number; totalPages: number; products: Product[] }> {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.brand && params.brand !== 'All') query.set('brand', params.brand);
    if (params.minPrice) query.set('minPrice', String(params.minPrice));
    if (params.maxPrice) query.set('maxPrice', String(params.maxPrice));
    if (params.search) query.set('search', params.search);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch products');
    return data;
  },

  async getProductById(id: string): Promise<{ product: Product; reviews: Review[] }> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Product not found');
    return data;
  },

  async getCategories(): Promise<CategoryInfo[]> {
    const res = await fetch(`${API_BASE}/products/categories`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch categories');
    return data.categories;
  },

  async compareProducts(productIds: string[]): Promise<{
    products: Product[];
    specKeys: string[];
    highlights: ComparisonHighlights;
  }> {
    const res = await fetch(`${API_BASE}/products/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ productIds }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to compare products');
    return data;
  },

  // Recommendations
  async getRecommendations(criteria: {
    query?: string;
    category?: string;
    maxBudgetINR?: number;
    minBudgetINR?: number;
    usagePurpose?: string;
    priorityFeature?: string;
    weights?: Partial<RecommendationWeights>;
  }): Promise<RecommendationResponse> {
    const res = await fetch(`${API_BASE}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(criteria),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to generate recommendations');
    return data.data;
  },

  async chatAssistant(message: string): Promise<{
    reply: string;
    recommendations: RecommendationResponse;
    suggestedQuestions: string[];
    isAiPowered: boolean;
  }> {
    const res = await fetch(`${API_BASE}/recommendations/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Assistant error');
    return data;
  },

  async getWeights(): Promise<RecommendationWeights> {
    const res = await fetch(`${API_BASE}/recommendations/weights`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error('Failed to get weights');
    return data.weights;
  },

  async updateWeights(weights: Partial<RecommendationWeights>): Promise<RecommendationWeights> {
    const res = await fetch(`${API_BASE}/recommendations/weights`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weights),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error('Failed to update weights');
    return data.weights;
  },

  // Reviews
  async addReview(payload: {
    productId: string;
    rating: number;
    title: string;
    comment: string;
  }): Promise<{ review: Review; sentimentAnalysis: any; updatedProductStats: any }> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to submit review');
    return data;
  },

  async analyzeReviewText(text: string, rating?: number) {
    const res = await fetch(`${API_BASE}/reviews/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, rating }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error('Analysis failed');
    return data.data;
  },

  // Favorites
  async getFavorites(): Promise<FavoriteItem[]> {
    const res = await fetch(`${API_BASE}/favorites`, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error('Failed to fetch favorites');
    return data.favorites;
  },

  async addFavorite(productId: string): Promise<FavoriteItem> {
    const res = await fetch(`${API_BASE}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to add favorite');
    return data.favorite;
  },

  async removeFavorite(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/favorites/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to remove favorite');
  },

  // History
  async getSearchHistory(): Promise<Array<{ id: string; query: string; category?: string; count?: number; createdAt: string }>> {
    const res = await fetch(`${API_BASE}/history/searches`, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok || !data.success) return [];
    return data.history;
  },

  async clearSearchHistory(): Promise<void> {
    await fetch(`${API_BASE}/history/searches`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
  },

  async getRecentRecommendations(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/history/recommendations`, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok || !data.success) return [];
    return data.recommendations;
  },

  // Test suite
  async runTestSuite(): Promise<any> {
    const res = await fetch(`${API_BASE}/test-suite/run`, {
      method: 'POST',
    });
    return res.json();
  },
};
