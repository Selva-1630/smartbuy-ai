import { User, Product, Review, FavoriteItem, ComparisonHistoryItem, SearchHistoryItem, RecommendationResponse } from '../types.js';
import { INITIAL_PRODUCTS, INITIAL_REVIEWS } from '../data/productsSeed.js';
import bcrypt from 'bcryptjs';

// In-Memory & Persistent Collection Storage
class Collection<T extends { id?: string; _id?: string }> {
  private items: T[] = [];
  public name: string;

  constructor(name: string, initialItems: T[] = []) {
    this.name = name;
    this.items = [...initialItems];
  }

  async find(filter: Partial<T> | ((item: T) => boolean) = {}): Promise<T[]> {
    if (typeof filter === 'function') {
      return this.items.filter(filter);
    }
    const filterKeys = Object.keys(filter) as (keyof T)[];
    if (filterKeys.length === 0) {
      return [...this.items];
    }
    return this.items.filter((item) => {
      return filterKeys.every((k) => item[k] === filter[k]);
    });
  }

  async findById(id: string): Promise<T | null> {
    const found = this.items.find((item) => (item as any).id === id || (item as any)._id === id);
    return found ? { ...found } : null;
  }

  async findOne(filter: Partial<T> | ((item: T) => boolean)): Promise<T | null> {
    const results = await this.find(filter);
    return results.length > 0 ? { ...results[0] } : null;
  }

  async insertOne(doc: T): Promise<T> {
    const newDoc = {
      ...doc,
      id: (doc as any).id || (doc as any)._id || `${this.name.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    this.items.push(newDoc);
    return { ...newDoc };
  }

  async updateOne(filter: Partial<T> | ((item: T) => boolean), update: Partial<T>): Promise<T | null> {
    let index = -1;
    if (typeof filter === 'function') {
      index = this.items.findIndex(filter);
    } else {
      const keys = Object.keys(filter) as (keyof T)[];
      index = this.items.findIndex((item) => keys.every((k) => item[k] === filter[k]));
    }

    if (index === -1) return null;
    this.items[index] = {
      ...this.items[index],
      ...update,
    };
    return { ...this.items[index] };
  }

  async deleteOne(filter: Partial<T> | ((item: T) => boolean)): Promise<boolean> {
    let index = -1;
    if (typeof filter === 'function') {
      index = this.items.findIndex(filter);
    } else {
      const keys = Object.keys(filter) as (keyof T)[];
      index = this.items.findIndex((item) => keys.every((k) => item[k] === filter[k]));
    }

    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }

  async deleteMany(filter: Partial<T> | ((item: T) => boolean)): Promise<number> {
    const beforeCount = this.items.length;
    if (typeof filter === 'function') {
      this.items = this.items.filter((item) => !filter(item));
    } else {
      const keys = Object.keys(filter) as (keyof T)[];
      this.items = this.items.filter((item) => !keys.every((k) => item[k] === filter[k]));
    }
    return beforeCount - this.items.length;
  }

  async countDocuments(filter: Partial<T> | ((item: T) => boolean) = {}): Promise<number> {
    const docs = await this.find(filter);
    return docs.length;
  }

  async reset(seedItems: T[] = []) {
    this.items = [...seedItems];
  }
}

export interface RecommendationHistoryItem {
  id: string;
  userId?: string;
  query: string;
  category?: string;
  budgetINR?: number;
  result: RecommendationResponse;
  createdAt: string;
}

export class Database {
  public users = new Collection<User>('users');
  public products = new Collection<Product>('products', INITIAL_PRODUCTS);
  public reviews = new Collection<Review>('reviews', INITIAL_REVIEWS);
  public favorites = new Collection<FavoriteItem>('favorites');
  public comparisons = new Collection<ComparisonHistoryItem>('comparisons');
  public searchHistory = new Collection<SearchHistoryItem>('searchHistory');
  public recommendations = new Collection<RecommendationHistoryItem>('recommendations');
  public isConnected = true;
  public connectionType: 'memory-persistent' | 'mongodb' = 'memory-persistent';

  async init() {
    // Seed default verified test user
    const existingUser = await this.users.findOne({ email: 'user@smartbuy.ai' });
    if (!existingUser) {
      const passwordHash = await bcrypt.hash('password123', 10);
      await this.users.insertOne({
        id: 'user-default-01',
        name: 'Alex Johnson',
        email: 'user@smartbuy.ai',
        passwordHash,
        createdAt: new Date().toISOString(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      });
    }

    // Seed some initial search history & favorites for instant dashboard delight
    const defaultFavoritesCount = await this.favorites.countDocuments();
    if (defaultFavoritesCount === 0) {
      const laptop = await this.products.findById('prod-lp-01');
      const headphones = await this.products.findById('prod-hp-01');
      if (laptop) {
        await this.favorites.insertOne({
          id: 'fav-01',
          userId: 'user-default-01',
          productId: laptop.id,
          product: laptop,
          createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        });
      }
      if (headphones) {
        await this.favorites.insertOne({
          id: 'fav-02',
          userId: 'user-default-01',
          productId: headphones.id,
          product: headphones,
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        });
      }
    }

    // Seed initial search history
    const searchesCount = await this.searchHistory.countDocuments();
    if (searchesCount === 0) {
      await this.searchHistory.insertOne({
        id: 'sh-01',
        userId: 'user-default-01',
        query: 'laptop under 60000',
        category: 'Laptops',
        resultsCount: 4,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      });
      await this.searchHistory.insertOne({
        id: 'sh-02',
        userId: 'user-default-01',
        query: 'noise cancelling headphones',
        category: 'Headphones',
        resultsCount: 3,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      });
    }

    console.log('✅ SmartBuy AI Database initialized with seeded collections (Products, Reviews, Users, Favorites, Searches, Recommendations)');
  }
}

export const db = new Database();
