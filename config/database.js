const { MongoClient } = require('mongodb');

// Database configuration
const DB_CONFIG = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DB_NAME || 'maxerfodimo',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  // Future database configurations can be added here
  // postgresql: { ... },
  // mysql: { ... },
  // redis: { ... }
};

// Database type selection
const DB_TYPE = process.env.DB_TYPE || 'mongodb';

class DatabaseManager {
  constructor() {
    this.connection = null;
    this.db = null;
    this.config = DB_CONFIG[DB_TYPE];
  }

  async connect() {
    try {
      if (DB_TYPE === 'mongodb') {
        return await this.connectMongoDB();
      }
      // Future database connections can be added here
      // else if (DB_TYPE === 'postgresql') {
      //   return await this.connectPostgreSQL();
      // }
      
      throw new Error(`Unsupported database type: ${DB_TYPE}`);
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  async connectMongoDB() {
    try {
      this.connection = new MongoClient(this.config.url, this.config.options);
      await this.connection.connect();
      this.db = this.connection.db(this.config.dbName);
      
      console.log(`✅ Connected to MongoDB: ${this.config.dbName}`);
      return this.db;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await this.connection.close();
        console.log('✅ Database connection closed');
      }
    } catch (error) {
      console.error('Database disconnection error:', error);
      throw error;
    }
  }

  getDatabase() {
    return this.db;
  }

  getConnection() {
    return this.connection;
  }

  getDatabaseType() {
    return DB_TYPE;
  }
}

// Singleton instance
const databaseManager = new DatabaseManager();

module.exports = databaseManager; 