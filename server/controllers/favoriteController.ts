import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user-default-01'; // support default preview user if not signed in
    const favorites = await db.favorites.find({ userId });

    // Refresh product objects to ensure latest prices/ratings
    const refreshed = await Promise.all(
      favorites.map(async (fav) => {
        const prod = await db.products.findById(fav.productId);
        return {
          ...fav,
          product: prod || fav.product,
        };
      })
    );

    res.json({
      success: true,
      count: refreshed.length,
      favorites: refreshed,
    });
  } catch (err: any) {
    console.error('Error fetching favorites:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve favorites' });
  }
};

export const addFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.body;
    const userId = req.user?.id || 'user-default-01';

    if (!productId) {
      res.status(400).json({ success: false, error: 'Product ID is required' });
      return;
    }

    const product = await db.products.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    // Check if already favorited
    const existing = await db.favorites.findOne({ userId, productId });
    if (existing) {
      res.json({
        success: true,
        message: 'Product already in favorites',
        favorite: existing,
      });
      return;
    }

    const newFav = await db.favorites.insertOne({
      id: `fav-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      productId,
      product,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Product added to favorites',
      favorite: newFav,
    });
  } catch (err: any) {
    console.error('Error adding favorite:', err);
    res.status(500).json({ success: false, error: 'Failed to add favorite' });
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'user-default-01';

    // Support deletion by favorite ID or productId
    const deleted = await db.favorites.deleteOne(
      (f) => (f.id === id || f.productId === id) && f.userId === userId
    );

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Favorite item not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Product removed from favorites',
    });
  } catch (err: any) {
    console.error('Error removing favorite:', err);
    res.status(500).json({ success: false, error: 'Failed to remove favorite' });
  }
};
