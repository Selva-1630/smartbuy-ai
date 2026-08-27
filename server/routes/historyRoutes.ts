import { Router } from 'express';
import {
  getSearchHistory,
  clearSearchHistory,
  getComparisonHistory,
  getRecommendationsHistory,
} from '../controllers/historyController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/searches', optionalAuth, getSearchHistory);
router.delete('/searches', optionalAuth, clearSearchHistory);
router.get('/comparisons', optionalAuth, getComparisonHistory);
router.get('/recommendations', optionalAuth, getRecommendationsHistory);

export default router;
