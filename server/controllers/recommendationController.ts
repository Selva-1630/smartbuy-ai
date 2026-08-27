import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { aiService } from '../services/aiService.js';
import { recommendationService } from '../services/recommendationService.js';
import { AuthRequest } from '../middleware/auth.js';

export const getRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      query,
      category,
      maxBudgetINR,
      minBudgetINR,
      usagePurpose,
      priorityFeature,
      weights,
      excludeProductIds,
    } = req.body;

    const allProducts = await db.products.find();

    const result = await aiService.getSmartRecommendation(allProducts, {
      query,
      category,
      maxBudgetINR: maxBudgetINR ? Number(maxBudgetINR) : undefined,
      minBudgetINR: minBudgetINR ? Number(minBudgetINR) : undefined,
      usagePurpose,
      priorityFeature,
      weights,
      excludeProductIds,
    });

    // Save to user recommendation history
    try {
      await db.recommendations.insertOne({
        id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: req.user?.id,
        query: query || `${category || 'All'} recommendation`,
        category: result.analysis.detectedCategory,
        budgetINR: result.analysis.detectedBudgetINR,
        result,
        createdAt: new Date().toISOString(),
      });
    } catch {
      // Non-blocking log
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('Recommendation error:', err);
    res.status(500).json({ success: false, error: 'Failed to compute recommendations' });
  }
};

export const chatAssistant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message } = req.body;

    if (!message || !String(message).trim()) {
      res.status(400).json({ success: false, error: 'Message cannot be empty' });
      return;
    }

    const allProducts = await db.products.find();
    const chatResult = await aiService.chatShoppingAssistant(String(message).trim(), allProducts);

    res.json({
      success: true,
      reply: chatResult.reply,
      recommendations: chatResult.recommendations,
      suggestedQuestions: chatResult.suggestedQuestions,
      isAiPowered: chatResult.isAiPowered,
    });
  } catch (err: any) {
    console.error('Assistant chat error:', err);
    res.status(500).json({ success: false, error: 'Failed to process assistant message' });
  }
};

export const getWeights = (req: Request, res: Response): void => {
  res.json({
    success: true,
    weights: recommendationService.getWeights(),
  });
};

export const updateWeights = (req: Request, res: Response): void => {
  try {
    const updated = recommendationService.updateWeights(req.body);
    res.json({
      success: true,
      weights: updated,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: 'Failed to update algorithm weights' });
  }
};
