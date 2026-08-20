import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Complaint API Routes
app.use('/api/complaints', complaintRoutes);

// Error Handler Middleware
app.use(errorHandler);

// Port configuration
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`[CivicAsset Server] Running on port ${PORT}`);
});

export { app, server };
