import { Router } from 'express';
import {
  getProducts,
  getProductById,
  searchProducts,
  compareProducts,
  getCategories,
} from '../controllers/productController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/search', optionalAuth, searchProducts);
router.post('/compare', optionalAuth, compareProducts);
router.get('/:id', getProductById);
router.get('/', getProducts);

export default router;
