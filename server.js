const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import services
const quoteService = require('./services/quoteService');
const userService = require('./services/userService');

// Import routes
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Initialize database service
let isDatabaseReady = false;

async function initializeDatabase() {
  try {
    await quoteService.initialize();
    await userService.initialize();
    isDatabaseReady = true;
    console.log('✅ Database service ready');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Continue without database for now
    isDatabaseReady = false;
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Motivation Quotes API',
    version: '1.0.0',
    database: isDatabaseReady ? 'connected' : 'disconnected',
    endpoints: {
      // Public endpoints
      getAllQuotes: 'GET /api/quotes',
      getRandomQuote: 'GET /api/quotes/random',
      getQuoteById: 'GET /api/quotes/:id',
      getQuotesByCategory: 'GET /api/quotes/category/:category',
      healthCheck: 'GET /api/health',
      databaseStats: 'GET /api/stats',
      
      // Authentication endpoints
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      getProfile: 'GET /api/auth/profile',
      updateProfile: 'PUT /api/auth/profile',
      deleteProfile: 'DELETE /api/auth/profile',
      
      // Favorites endpoints (protected)
      getFavorites: 'GET /api/favorites',
      addToFavorites: 'POST /api/favorites/:quoteId',
      removeFromFavorites: 'DELETE /api/favorites/:quoteId',
      checkFavorite: 'GET /api/favorites/check/:quoteId'
    }
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Favorites routes
app.use('/api/favorites', favoritesRoutes);

// Get all quotes
app.get('/api/quotes', async (req, res) => {
  try {
    if (!isDatabaseReady) {
      return res.status(503).json({
        success: false,
        message: 'Database service not ready'
      });
    }
    
    const result = await quoteService.getAllQuotes();
    res.json(result);
  } catch (error) {
    console.error('Error getting all quotes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quotes',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Get a random quote
app.get('/api/quotes/random', async (req, res) => {
  try {
    if (!isDatabaseReady) {
      return res.status(503).json({
        success: false,
        message: 'Database service not ready'
      });
    }
    
    const result = await quoteService.getRandomQuote();
    res.json(result);
  } catch (error) {
    console.error('Error getting random quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get random quote',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Get quote by ID
app.get('/api/quotes/:id', async (req, res) => {
  try {
    if (!isDatabaseReady) {
      return res.status(503).json({
        success: false,
        message: 'Database service not ready'
      });
    }
    
    const result = await quoteService.getQuoteById(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error getting quote by ID:', error);
    if (error.message === 'Quote not found') {
      res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to get quote',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
});

// Get quotes by category
app.get('/api/quotes/category/:category', async (req, res) => {
  try {
    if (!isDatabaseReady) {
      return res.status(503).json({
        success: false,
        message: 'Database service not ready'
      });
    }
    
    const result = await quoteService.getQuotesByCategory(req.params.category);
    res.json(result);
  } catch (error) {
    console.error('Error getting quotes by category:', error);
    if (error.message === 'No quotes found for this category') {
      res.status(404).json({
        success: false,
        message: 'No quotes found for this category'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to get quotes by category',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
});

// Database health check
app.get('/api/health', async (req, res) => {
  try {
    if (!isDatabaseReady) {
      return res.status(503).json({
        success: false,
        message: 'Database service not ready'
      });
    }
    
    const result = await quoteService.healthCheck();
    res.json(result);
  } catch (error) {
    console.error('Error checking database health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check database health',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Database statistics
app.get('/api/stats', async (req, res) => {
  try {
    if (!isDatabaseReady) {
      return res.status(503).json({
        success: false,
        message: 'Database service not ready'
      });
    }
    
    const result = await quoteService.getDatabaseStats();
    res.json(result);
  } catch (error) {
    console.error('Error getting database stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get database statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}`);
  
  // Initialize database after server starts
  await initializeDatabase();
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
    server.listen(PORT + 1);
  } else {
    console.error('Server error:', err);
  }
}); 