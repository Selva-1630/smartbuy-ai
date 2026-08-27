import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const getSearchHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user-default-01';
    let history = await db.searchHistory.find((item) => item.userId === userId || !item.userId);

    // Sort latest first
    history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      count: history.length,
      history: history.slice(0, 20),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch search history' });
  }
};

export const clearSearchHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user-default-01';
    await db.searchHistory.deleteMany((item) => item.userId === userId || !item.userId);

    res.json({
      success: true,
      message: 'Search history cleared',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to clear search history' });
  }
};

export const getComparisonHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user-default-01';
    let comparisons = await db.comparisons.find((item) => item.userId === userId || !item.userId);

    comparisons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      count: comparisons.length,
      comparisons: comparisons.slice(0, 10),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch comparison history' });
  }
};

export const getRecommendationsHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user-default-01';
    let recs = await db.recommendations.find((item) => item.userId === userId || !item.userId);

    recs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      count: recs.length,
      recommendations: recs.slice(0, 10),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch recommendations history' });
  }
};
