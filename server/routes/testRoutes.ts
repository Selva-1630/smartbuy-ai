import { Router } from 'express';
import { runTestSuite } from '../controllers/testController.js';

const router = Router();

router.get('/run', runTestSuite);
router.post('/run', runTestSuite);

export default router;
