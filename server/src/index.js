import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Auth API Routes
app.use('/api/auth', authRoutes);

// Asset API Routes
app.use('/api/assets', assetRoutes);

// Error Handler Middleware
app.use(errorHandler);

// Port configuration
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`[CivicAsset Server] Running on port ${PORT}`);
});

export { app, server };
