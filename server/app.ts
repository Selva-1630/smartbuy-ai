import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import testRoutes from './routes/testRoutes.js';

const currentFilePath = typeof __filename === 'string' ? __filename : fileURLToPath(import.meta.url);
const __dirname = path.dirname(currentFilePath);

export const app = express();
let isInitialized = false;

export async function initializeApp() {
  if (isInitialized) return app;

  await db.init();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'SmartBuy AI Server',
      dbConnected: db.isConnected,
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/recommendations', recommendationRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/history', historyRoutes);
  app.use('/api/search-history', historyRoutes);
  app.use('/api/test-suite', testRoutes);

  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  });

  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({
          success: false,
          error: `API endpoint not found: ${req.method} ${req.originalUrl}`,
        });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  isInitialized = true;
  return app;
}

export default app;
