// PostgreSQL Database Template
// This is an example of how to add PostgreSQL support to the database abstraction layer

/*
const { Pool } = require('pg');

// Add this to the DB_CONFIG object in database.js:
postgresql: {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'motivation_quotes',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  options: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
},

// Add this method to the DatabaseManager class:
async connectPostgreSQL() {
  try {
    this.connection = new Pool({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
      ...this.config.options
    });
    
    // Test the connection
    await this.connection.query('SELECT NOW()');
    this.db = this.connection;
    
    console.log(`✅ Connected to PostgreSQL: ${this.config.database}`);
    return this.db;
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    throw error;
  }
}

// Add this to the connect() method:
else if (DB_TYPE === 'postgresql') {
  return await this.connectPostgreSQL();
}
*/

// Example PostgreSQL queries for the QuoteService:
/*
// Get all quotes
async getAllQuotes() {
  try {
    const result = await this.db.query('SELECT * FROM quotes ORDER BY id');
    return {
      success: true,
      count: result.rows.length,
      data: result.rows
    };
  } catch (error) {
    console.error('Error getting all quotes:', error);
    throw error;
  }
}

// Get random quote
async getRandomQuote() {
  try {
    const result = await this.db.query('SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1');
    
    if (result.rows.length === 0) {
      throw new Error('No quotes found in database');
    }

    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error) {
    console.error('Error getting random quote:', error);
    throw error;
  }
}

// Get quote by ID
async getQuoteById(id) {
  try {
    const result = await this.db.query('SELECT * FROM quotes WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      throw new Error('Quote not found');
    }

    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error) {
    console.error('Error getting quote by ID:', error);
    throw error;
  }
}

// Get quotes by category
async getQuotesByCategory(category) {
  try {
    const result = await this.db.query(
      'SELECT * FROM quotes WHERE LOWER(category) = LOWER($1)',
      [category]
    );

    if (result.rows.length === 0) {
      throw new Error('No quotes found for this category');
    }

    return {
      success: true,
      count: result.rows.length,
      data: result.rows
    };
  } catch (error) {
    console.error('Error getting quotes by category:', error);
    throw error;
  }
}
*/ 