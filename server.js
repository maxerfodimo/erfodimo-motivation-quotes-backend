const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Sample motivation quotes data
const motivationQuotes = [
  {
    id: 1,
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "passion"
  },
  {
    id: 2,
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "perseverance"
  },
  {
    id: 3,
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "dreams"
  },
  {
    id: 4,
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    category: "perseverance"
  },
  {
    id: 5,
    text: "The only limit to our realization of tomorrow is our doubts of today.",
    author: "Franklin D. Roosevelt",
    category: "optimism"
  }
];

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Motivation Quotes API',
    version: '1.0.0',
    endpoints: {
      getAllQuotes: 'GET /api/quotes',
      getRandomQuote: 'GET /api/quotes/random',
      getQuoteById: 'GET /api/quotes/:id',
      getQuotesByCategory: 'GET /api/quotes/category/:category'
    }
  });
});

// Get all quotes
app.get('/api/quotes', (req, res) => {
  res.json({
    success: true,
    count: motivationQuotes.length,
    data: motivationQuotes
  });
});

// Get a random quote
app.get('/api/quotes/random', (req, res) => {
  const randomIndex = Math.floor(Math.random() * motivationQuotes.length);
  const randomQuote = motivationQuotes[randomIndex];
  
  res.json({
    success: true,
    data: randomQuote
  });
});

// Get quote by ID
app.get('/api/quotes/:id', (req, res) => {
  const quoteId = parseInt(req.params.id);
  const quote = motivationQuotes.find(q => q.id === quoteId);
  
  if (!quote) {
    return res.status(404).json({
      success: false,
      message: 'Quote not found'
    });
  }
  
  res.json({
    success: true,
    data: quote
  });
});

// Get quotes by category
app.get('/api/quotes/category/:category', (req, res) => {
  const category = req.params.category.toLowerCase();
  const filteredQuotes = motivationQuotes.filter(q => 
    q.category.toLowerCase() === category
  );
  
  if (filteredQuotes.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No quotes found for this category'
    });
  }
  
  res.json({
    success: true,
    count: filteredQuotes.length,
    data: filteredQuotes
  });
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
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}`);
}); 