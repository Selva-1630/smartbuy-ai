import { Router } from 'express';
import {
  getRecommendations,
  chatAssistant,
  getWeights,
  updateWeights,
} from '../controllers/recommendationController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', optionalAuth, getRecommendations);
router.post('/chat', optionalAuth, chatAssistant);
router.get('/weights', getWeights);
router.put('/weights', updateWeights);

export default router;
