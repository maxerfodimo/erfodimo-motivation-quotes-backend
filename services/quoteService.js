const databaseManager = require('../config/database');

class QuoteService {
  constructor() {
    this.db = null;
    this.collection = null;
  }

  async initialize() {
    try {
      this.db = await databaseManager.connect();
      this.collection = this.db.collection('quotes');
      
      // Initialize with sample data if collection is empty
      await this.initializeSampleData();
      
      console.log('✅ Quote service initialized');
    } catch (error) {
      console.error('Quote service initialization error:', error);
      throw error;
    }
  }

  async initializeSampleData() {
    try {
      const count = await this.collection.countDocuments();
      
      if (count === 0) {
        const sampleQuotes = [
          {
            id: 1,
            text: "The only way to do great work is to love what you do.",
            author: "Steve Jobs",
            category: "passion",
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 2,
            text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            author: "Winston Churchill",
            category: "perseverance",
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 3,
            text: "The future belongs to those who believe in the beauty of their dreams.",
            author: "Eleanor Roosevelt",
            category: "dreams",
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 4,
            text: "Don't watch the clock; do what it does. Keep going.",
            author: "Sam Levenson",
            category: "perseverance",
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 5,
            text: "The only limit to our realization of tomorrow is our doubts of today.",
            author: "Franklin D. Roosevelt",
            category: "optimism",
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        await this.collection.insertMany(sampleQuotes);
        console.log('✅ Sample quotes initialized in database');
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
      throw error;
    }
  }

  // Database operation methods (for future CRUD operations)
  async getAllQuotes() {
    try {
      const quotes = await this.collection.find({}).toArray();
      return {
        success: true,
        count: quotes.length,
        data: quotes
      };
    } catch (error) {
      console.error('Error getting all quotes:', error);
      throw error;
    }
  }

  async getRandomQuote() {
    try {
      // MongoDB aggregation to get a random document
      const pipeline = [
        { $sample: { size: 1 } }
      ];
      
      const quotes = await this.collection.aggregate(pipeline).toArray();
      
      if (quotes.length === 0) {
        throw new Error('No quotes found in database');
      }

      return {
        success: true,
        data: quotes[0]
      };
    } catch (error) {
      console.error('Error getting random quote:', error);
      throw error;
    }
  }

  async getQuoteById(id) {
    try {
      const quote = await this.collection.findOne({ id: parseInt(id) });
      
      if (!quote) {
        throw new Error('Quote not found');
      }

      return {
        success: true,
        data: quote
      };
    } catch (error) {
      console.error('Error getting quote by ID:', error);
      throw error;
    }
  }

  async getQuotesByCategory(category) {
    try {
      const quotes = await this.collection.find({ 
        category: category.toLowerCase() 
      }).toArray();

      if (quotes.length === 0) {
        throw new Error('No quotes found for this category');
      }

      return {
        success: true,
        count: quotes.length,
        data: quotes
      };
    } catch (error) {
      console.error('Error getting quotes by category:', error);
      throw error;
    }
  }

  // Database health check
  async healthCheck() {
    try {
      const result = await this.db.admin().ping();
      return {
        success: true,
        database: databaseManager.getDatabaseType(),
        status: 'connected',
        ping: result
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      return {
        success: false,
        database: databaseManager.getDatabaseType(),
        status: 'disconnected',
        error: error.message
      };
    }
  }

  // Get database statistics
  async getDatabaseStats() {
    try {
      const stats = await this.db.stats();
      const collectionStats = await this.collection.stats();
      
      return {
        success: true,
        database: databaseManager.getDatabaseType(),
        databaseStats: {
          collections: stats.collections,
          dataSize: stats.dataSize,
          storageSize: stats.storageSize,
          indexes: stats.indexes
        },
        collectionStats: {
          count: collectionStats.count,
          size: collectionStats.size,
          avgObjSize: collectionStats.avgObjSize
        }
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }
}

// Singleton instance
const quoteService = new QuoteService();

module.exports = quoteService; 