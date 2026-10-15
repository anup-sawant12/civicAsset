const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const assetRoutes = require('./src/routes/assetRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const workOrderRoutes = require('./src/routes/workOrderRoutes');
const auditRoutes = require('./src/routes/auditRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'CivicAsset API',
    timestamp: new Date().toISOString()
  });
});

// Authentication, Admin, Asset, Complaint, and Work Order routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/departments', departmentRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/admin/audit-logs', auditRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/work-orders', workOrderRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CivicAsset Server running on port ${PORT}`);
  });
}

module.exports = app;
