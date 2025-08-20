const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const { authenticateToken, generateToken } = require('../middleware/auth');

// User registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const result = await userService.registerUser({ email, password, name });
    
    // Generate JWT token
    const token = generateToken(result.user._id.toString(), result.user.email);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result.user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await userService.loginUser(email, password);
    
    // Generate JWT token
    const token = generateToken(result.user._id.toString(), result.user.email);
    
    res.json({
      success: true,
      message: 'Login successful',
      user: result.user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

// Get current user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await userService.getUserById(req.user.userId);
    
    res.json({
      success: true,
      user: result.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Update user profile (protected route)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    const result = await userService.updateUser(req.user.userId, updateData);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete user account (protected route)
router.delete('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await userService.deleteUser(req.user.userId);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 