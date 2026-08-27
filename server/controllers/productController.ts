import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { Product } from '../types.js';
import { AuthRequest } from '../middleware/auth.js';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      sortBy = 'rating',
      page = '1',
      limit = '50',
    } = req.query;

    let products = await db.products.find();

    // Filter by Category
    if (category && category !== 'All') {
      products = products.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
    }

    // Filter by Brand
    if (brand && brand !== 'All') {
      products = products.filter((p) => p.brand.toLowerCase() === String(brand).toLowerCase());
    }

    // Filter by Min Price
    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) {
        products = products.filter((p) => p.priceINR >= min);
      }
    }

    // Filter by Max Price
    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) {
        products = products.filter((p) => p.priceINR <= max);
      }
    }

    // Search query filter
    if (search && String(search).trim()) {
      const q = String(search).toLowerCase().trim();
      products = products.filter((p) => {
        const fullText = `${p.name} ${p.brand} ${p.category} ${p.summary} ${p.features.join(' ')}`.toLowerCase();
        return fullText.includes(q);
      });
    }

    // Sorting
    products.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.priceINR - b.priceINR;
        case 'price-desc':
          return b.priceINR - a.priceINR;
        case 'value-desc':
          return b.valueScore - a.valueScore;
        case 'rating':
        default:
          return b.rating - a.rating;
      }
    });

    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 50;
    const startIndex = (pageNum - 1) * limitNum;
    const total = products.length;
    const paginated = products.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      products: paginated,
    });
  } catch (err: any) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve products' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await db.products.findById(id);

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found with the requested ID' });
      return;
    }

    // Fetch live reviews for this product
    const reviews = await db.reviews.find((r) => r.productId === id);

    res.json({
      success: true,
      product,
      reviews,
    });
  } catch (err: any) {
    console.error('Error fetching product details:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve product details' });
  }
};

export const searchProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q, category } = req.query;

    if (!q || !String(q).trim()) {
      res.status(400).json({ success: false, error: 'Search term query "q" is required' });
      return;
    }

    const queryStr = String(q).toLowerCase().trim();
    let products = await db.products.find();

    if (category && category !== 'All') {
      products = products.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
    }

    const matches = products.filter((p) => {
      const fullText = `${p.name} ${p.brand} ${p.category} ${p.summary} ${p.features.join(' ')}`.toLowerCase();
      return fullText.includes(queryStr);
    });

    // Save to search history
    try {
      await db.searchHistory.insertOne({
        id: `sh-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        userId: req.user?.id,
        query: queryStr,
        category: category ? String(category) : undefined,
        resultsCount: matches.length,
        createdAt: new Date().toISOString(),
      });
    } catch {
      // Non-blocking history log
    }

    res.json({
      success: true,
      query: queryStr,
      count: matches.length,
      products: matches,
    });
  } catch (err: any) {
    console.error('Search error:', err);
    res.status(500).json({ success: false, error: 'Failed to perform search' });
  }
};

export const compareProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length < 2 || productIds.length > 4) {
      res.status(400).json({
        success: false,
        error: 'Please provide between 2 and 4 valid product IDs to compare',
      });
      return;
    }

    const products: Product[] = [];
    for (const id of productIds) {
      const p = await db.products.findById(id);
      if (p) products.push(p);
    }

    if (products.length < 2) {
      res.status(400).json({
        success: false,
        error: 'At least 2 valid products must exist to run comparison',
      });
      return;
    }

    // Determine Winners
    // Best Rated
    const sortedByRating = [...products].sort((a, b) => b.rating - a.rating);
    const bestRated = sortedByRating[0];

    // Best Value
    const sortedByValue = [...products].sort((a, b) => b.valueScore - a.valueScore);
    const bestValue = sortedByValue[0];

    // Budget Choice (Lowest price)
    const sortedByPrice = [...products].sort((a, b) => a.priceINR - b.priceINR);
    const budgetChoice = sortedByPrice[0];

    // Best Overall (Composite score: 40% rating, 35% value, 25% sentiment)
    const scored = products.map((p) => {
      const composite = (p.rating / 5) * 40 + (p.valueScore / 100) * 35 + ((p.sentimentSummary?.overallScore || 80) / 100) * 25;
      return { product: p, composite };
    });
    scored.sort((a, b) => b.composite - a.composite);
    const bestOverall = scored[0].product;

    // Collect distinct spec keys
    const allSpecKeys = Array.from(
      new Set(products.flatMap((p) => Object.keys(p.specs || {})))
    );

    // Save comparison history
    try {
      await db.comparisons.insertOne({
        id: `cmp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: req.user?.id,
        productIds: products.map((p) => p.id),
        products,
        winnerId: bestOverall.id,
        createdAt: new Date().toISOString(),
      });
    } catch {
      // Non-blocking log
    }

    res.json({
      success: true,
      products,
      specKeys: allSpecKeys,
      highlights: {
        bestOverall: {
          id: bestOverall.id,
          name: bestOverall.name,
          reason: `Highest composite index with ${bestOverall.rating}★ rating and ${bestOverall.valueScore}/100 value score.`,
        },
        bestValue: {
          id: bestValue.id,
          name: bestValue.name,
          reason: `Exceptional value score of ${bestValue.valueScore}/100 with premium specs.`,
        },
        bestRated: {
          id: bestRated.id,
          name: bestRated.name,
          reason: `Top customer satisfaction score of ${bestRated.rating}★ from ${bestRated.reviewCount.toLocaleString()} reviews.`,
        },
        budgetChoice: {
          id: budgetChoice.id,
          name: budgetChoice.name,
          reason: `Most economical option at ₹${budgetChoice.priceINR.toLocaleString('en-IN')}.`,
        },
      },
    });
  } catch (err: any) {
    console.error('Comparison error:', err);
    res.status(500).json({ success: false, error: 'Failed to process product comparison' });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await db.products.find();
    const categoriesMap: Record<string, { count: number; minPrice: number; maxPrice: number; icon: string; image: string }> = {};

    const categoryIcons: Record<string, { icon: string; image: string }> = {
      'Smartphones': {
        icon: 'Smartphone',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
      },
      'Laptops': {
        icon: 'Laptop',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
      },
      'Headphones': {
        icon: 'Headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      },
      'Smart Watches': {
        icon: 'Watch',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      },
      'Tablets': {
        icon: 'Tablet',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
      },
      'Monitors': {
        icon: 'Monitor',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
      },
    };

    products.forEach((p) => {
      if (!categoriesMap[p.category]) {
        categoriesMap[p.category] = {
          count: 0,
          minPrice: p.priceINR,
          maxPrice: p.priceINR,
          icon: categoryIcons[p.category]?.icon || 'Package',
          image: categoryIcons[p.category]?.image || p.image,
        };
      }
      categoriesMap[p.category].count += 1;
      categoriesMap[p.category].minPrice = Math.min(categoriesMap[p.category].minPrice, p.priceINR);
      categoriesMap[p.category].maxPrice = Math.max(categoriesMap[p.category].maxPrice, p.priceINR);
    });

    const result = Object.entries(categoriesMap).map(([name, data]) => ({
      name,
      ...data,
    }));

    res.json({
      success: true,
      categories: result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
};
