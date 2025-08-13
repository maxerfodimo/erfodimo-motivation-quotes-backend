# Motivation Quotes Backend API

A simple Express.js REST API for serving motivational quotes.

## Features

- 🚀 Express.js server with security middleware
- 📖 RESTful API endpoints for quotes
- 🔒 Security headers with Helmet
- 📝 Request logging with Morgan
- 🌐 CORS enabled for cross-origin requests
- 🎯 Error handling and validation
- 🗄️ Modular database abstraction layer
- 🔄 Easy database switching (MongoDB, PostgreSQL, etc.)
- 📊 Database health monitoring and statistics

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd erfodimo-motivation-quotes-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure database (optional):
   - For MongoDB: Set `MONGODB_URI` and `MONGODB_DB_NAME` in `.env`
   - For other databases: Set `DB_TYPE` and corresponding connection variables

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Get API Information
```
GET /
```
Returns API information and available endpoints.

#### 2. Get All Quotes
```
GET /api/quotes
```
Returns all available motivation quotes.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "text": "The only way to do great work is to love what you do.",
      "author": "Steve Jobs",
      "category": "passion"
    }
  ]
}
```

#### 3. Get Random Quote
```
GET /api/quotes/random
```
Returns a random motivation quote.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "text": "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "author": "Winston Churchill",
    "category": "perseverance"
  }
}
```

#### 4. Get Quote by ID
```
GET /api/quotes/:id
```
Returns a specific quote by its ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "text": "The only way to do great work is to love what you do.",
    "author": "Steve Jobs",
    "category": "passion"
  }
}
```

#### 5. Get Quotes by Category
```
GET /api/quotes/category/:category
```
Returns all quotes from a specific category.

**Available categories:**
- passion
- perseverance
- dreams
- optimism

#### 6. Database Health Check
```
GET /api/health
```
Returns database connection status and health information.

#### 7. Database Statistics
```
GET /api/stats
```
Returns database and collection statistics.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 2,
      "text": "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "author": "Winston Churchill",
      "category": "perseverance"
    },
    {
      "id": 4,
      "text": "Don't watch the clock; do what it does. Keep going.",
      "author": "Sam Levenson",
      "category": "perseverance"
    }
  ]
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `404` - Resource not found
- `500` - Internal server error

## Development

### Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-reload
- `npm test` - Run tests (when implemented)

### Project Structure

```
erfodimo-motivation-quotes-backend/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── README.md          # This file
└── .env.example       # Environment variables template
```

## Technologies Used

- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Morgan** - HTTP request logger
- **dotenv** - Environment variables
- **MongoDB** - NoSQL database (with abstraction layer for easy switching)

## Database Abstraction Layer

The application includes a modular database abstraction layer that allows you to easily switch between different database systems:

### Current Support
- **MongoDB** (default) - NoSQL document database

### Adding New Databases
To add support for a new database:

1. **Install the database driver:**
   ```bash
   yarn add <database-driver>
   ```

2. **Update `config/database.js`:**
   - Add configuration to `DB_CONFIG`
   - Add connection method to `DatabaseManager` class
   - Update the `connect()` method

3. **Update `services/quoteService.js`:**
   - Modify database operations for the new database syntax

4. **Set environment variable:**
   ```bash
   DB_TYPE=<database-type>
   ```

### Example: Adding PostgreSQL
See `config/database-templates/postgresql-template.js` for a complete example of how to add PostgreSQL support.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 