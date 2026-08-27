import { Router } from 'express';
import {
  getProductReviews,
  addReview,
  analyzeReviewText,
} from '../controllers/reviewController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/analyze', analyzeReviewText);
router.get('/product/:productId', getProductReviews);
router.post('/', optionalAuth, addReview);

export default router;
