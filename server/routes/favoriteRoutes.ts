import { Router } from 'express';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../controllers/favoriteController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getFavorites);
router.post('/', optionalAuth, addFavorite);
router.delete('/:id', optionalAuth, removeFavorite);

export default router;
