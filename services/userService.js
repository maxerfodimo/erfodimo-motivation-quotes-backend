const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const validator = require('validator');
const databaseManager = require('../config/database');

class UserService {
  constructor() {
    this.db = null;
    this.usersCollection = null;
    this.favoritesCollection = null;
  }

  async initialize() {
    this.db = databaseManager.getDatabase();
    this.usersCollection = this.db.collection('users');
    this.favoritesCollection = this.db.collection('favorites');
    
    // Create indexes for better performance
    await this.usersCollection.createIndex({ email: 1 }, { unique: true });
    await this.favoritesCollection.createIndex({ userId: 1, quoteId: 1 }, { unique: true });
  }

  // User registration
  async registerUser(userData) {
    const { email, password, name } = userData;

    // Validation
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required');
    }

    if (!validator.isEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await this.usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.usersCollection.insertOne(newUser);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return {
      success: true,
      user: {
        ...userWithoutPassword,
        _id: result.insertedId
      }
    };
  }

  // User login
  async loginUser(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user by email
    const user = await this.usersCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      user: userWithoutPassword
    };
  }

  // Get user by ID
  async getUserById(userId) {
    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const user = await this.usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return {
      success: true,
      user: userWithoutPassword
    };
  }

  // Update user profile
  async updateUser(userId, updateData) {
    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const { name, email } = updateData;
    const updateFields = { updatedAt: new Date() };

    if (name) {
      updateFields.name = name.trim();
    }

    if (email) {
      if (!validator.isEmail(email)) {
        throw new Error('Invalid email format');
      }
      
      // Check if email is already taken by another user
      const existingUser = await this.usersCollection.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: new ObjectId(userId) }
      });
      
      if (existingUser) {
        throw new Error('Email is already taken');
      }
      
      updateFields.email = email.toLowerCase();
    }

    const result = await this.usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      throw new Error('User not found');
    }

    return {
      success: true,
      message: 'User updated successfully'
    };
  }

  // Delete user
  async deleteUser(userId) {
    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    // Delete user's favorites first
    await this.favoritesCollection.deleteMany({ userId: new ObjectId(userId) });

    // Delete user
    const result = await this.usersCollection.deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      throw new Error('User not found');
    }

    return {
      success: true,
      message: 'User deleted successfully'
    };
  }

  // Add quote to favorites
  async addToFavorites(userId, quoteId) {
    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    if (!ObjectId.isValid(quoteId)) {
      throw new Error('Invalid quote ID');
    }

    try {
      await this.favoritesCollection.insertOne({
        userId: new ObjectId(userId),
        quoteId: new ObjectId(quoteId),
        addedAt: new Date()
      });

      return {
        success: true,
        message: 'Quote added to favorites'
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Quote is already in favorites');
      }
      throw error;
    }
  }

  // Remove quote from favorites
  async removeFromFavorites(userId, quoteId) {
    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    if (!ObjectId.isValid(quoteId)) {
      throw new Error('Invalid quote ID');
    }

    const result = await this.favoritesCollection.deleteOne({
      userId: new ObjectId(userId),
      quoteId: new ObjectId(quoteId)
    });

    if (result.deletedCount === 0) {
      throw new Error('Quote not found in favorites');
    }

    return {
      success: true,
      message: 'Quote removed from favorites'
    };
  }

  // Get user's favorite quotes
  async getFavorites(userId) {
    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const favorites = await this.favoritesCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ addedAt: -1 })
      .toArray();

    return {
      success: true,
      favorites: favorites
    };
  }

  // Check if quote is in user's favorites
  async isFavorite(userId, quoteId) {
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(quoteId)) {
      return false;
    }

    const favorite = await this.favoritesCollection.findOne({
      userId: new ObjectId(userId),
      quoteId: new ObjectId(quoteId)
    });

    return {
      success: true,
      isFavorite: !!favorite
    };
  }
}

module.exports = new UserService(); 