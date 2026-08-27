import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { sentimentService } from '../services/sentimentService.js';
import { aiService } from '../services/aiService.js';
import { AuthRequest } from '../middleware/auth.js';

export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const reviews = await db.reviews.find((r) => r.productId === productId);

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
};

export const addReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, rating, title, comment, verifiedPurchase = true } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, error: 'Product ID is required' });
      return;
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      res.status(400).json({ success: false, error: 'Rating must be a number between 1 and 5' });
      return;
    }

    if (!comment || !comment.trim() || comment.trim().length < 5) {
      res.status(400).json({ success: false, error: 'Review comment must be at least 5 characters long' });
      return;
    }

    const product = await db.products.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    // Perform live sentiment analysis on this review text
    const textSentiment = sentimentService.analyzeReviewText(comment, numRating);

    const userName = req.user?.name || req.body.userName || 'Verified Buyer';

    const newReview = await db.reviews.insertOne({
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId,
      userId: req.user?.id,
      userName,
      rating: numRating,
      title: title?.trim() || `${numRating} Star Review`,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      verifiedPurchase: Boolean(verifiedPurchase),
      sentiment: textSentiment.sentiment,
      helpfulCount: 0,
    });

    // Recompute product aggregated rating and sentiment
    const allProductReviews = await db.reviews.find((r) => r.productId === productId);
    const totalRatingSum = allProductReviews.reduce((sum, r) => sum + r.rating, 0);
    const updatedRating = Math.round((totalRatingSum / allProductReviews.length) * 10) / 10;

    const updatedSentiment = await aiService.analyzeReviews(
      allProductReviews.map((r) => ({ comment: r.comment, rating: r.rating })),
      product.name
    );

    await db.products.updateOne({ id: productId }, {
      rating: updatedRating,
      reviewCount: allProductReviews.length,
      sentimentSummary: updatedSentiment,
    });

    res.status(201).json({
      success: true,
      review: newReview,
      sentimentAnalysis: textSentiment,
      updatedProductStats: {
        rating: updatedRating,
        reviewCount: allProductReviews.length,
        sentimentSummary: updatedSentiment,
      },
    });
  } catch (err: any) {
    console.error('Error adding review:', err);
    res.status(500).json({ success: false, error: 'Failed to submit review' });
  }
};

export const analyzeReviewText = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, rating } = req.body;

    if (!text || !String(text).trim()) {
      res.status(400).json({ success: false, error: 'Text to analyze is required' });
      return;
    }

    const analysis = sentimentService.analyzeReviewText(String(text), rating ? Number(rating) : undefined);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to analyze review text' });
  }
};
