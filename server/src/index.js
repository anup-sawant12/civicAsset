require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');

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

// Error Handler Middleware
app.use(errorHandler);

// Port configuration
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`[CivicAsset Server] Running on port ${PORT}`);
});

module.exports = { app, server };
