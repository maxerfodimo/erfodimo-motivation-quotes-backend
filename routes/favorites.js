const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const { authenticateToken } = require('../middleware/auth');

// Get user's favorite quotes (protected route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await userService.getFavorites(req.user.userId);
    
    res.json({
      success: true,
      favorites: result.favorites
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Add quote to favorites (protected route)
router.post('/:quoteId', authenticateToken, async (req, res) => {
  try {
    const { quoteId } = req.params;
    
    const result = await userService.addToFavorites(req.user.userId, quoteId);
    
    res.status(201).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Remove quote from favorites (protected route)
router.delete('/:quoteId', authenticateToken, async (req, res) => {
  try {
    const { quoteId } = req.params;
    
    const result = await userService.removeFromFavorites(req.user.userId, quoteId);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Check if quote is in favorites (protected route)
router.get('/check/:quoteId', authenticateToken, async (req, res) => {
  try {
    const { quoteId } = req.params;
    
    const result = await userService.isFavorite(req.user.userId, quoteId);
    
    res.json({
      success: true,
      isFavorite: result.isFavorite
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 