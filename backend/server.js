const express = require('express');
const cors = require('cors');
require('dotenv').config();

const transactionRoutes = require('./routes/transactions');
const menuRoutes = require('./routes/menus');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// API Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/menus', menuRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📝 API Documentation:`);
  console.log(`   POST   /api/transactions - Create transaction`);
  console.log(`   GET    /api/transactions - Get all transactions`);
  console.log(`   GET    /api/transactions?date=YYYY-MM-DD - Get transactions by date`);
  console.log(`   GET    /api/transactions/daily/summary - Get daily summary`);
  console.log(`   GET    /api/transactions/stats/weekly - Get weekly stats`);
  console.log(`   GET    /api/transactions/stats/monthly - Get monthly stats`);
});
