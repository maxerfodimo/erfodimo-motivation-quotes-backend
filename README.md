# Motivation Quotes Backend API

A Node.js/Express backend API for managing motivation quotes with user authentication and favorites functionality.

## Features

- **Quote Management**: Get all quotes, random quotes, quotes by category
- **User Authentication**: JWT-based authentication with registration and login
- **User Profiles**: View, update, and delete user profiles
- **Favorites System**: Add/remove quotes to favorites, view favorite quotes
- **Database**: MongoDB with automatic indexing and connection management
- **Security**: Password hashing, JWT tokens, input validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd erfodimo-motivation-quotes-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Configure your `.env` file:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=motivation_quotes

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

5. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Public Endpoints

#### Get All Quotes
```
GET /api/quotes
```

#### Get Random Quote
```
GET /api/quotes/random
```

#### Get Quote by ID
```
GET /api/quotes/:id
```

#### Get Quotes by Category
```
GET /api/quotes/category/:category
```

#### Health Check
```
GET /api/health
```

#### Database Statistics
```
GET /api/stats
```

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Profile (Protected)
```
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

#### Update User Profile (Protected)
```
PUT /api/auth/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

#### Delete User Account (Protected)
```
DELETE /api/auth/profile
Authorization: Bearer <jwt-token>
```

### Favorites Endpoints (Protected)

#### Get User's Favorite Quotes
```
GET /api/favorites
Authorization: Bearer <jwt-token>
```

#### Add Quote to Favorites
```
POST /api/favorites/:quoteId
Authorization: Bearer <jwt-token>
```

#### Remove Quote from Favorites
```
DELETE /api/favorites/:quoteId
Authorization: Bearer <jwt-token>
```

#### Check if Quote is in Favorites
```
GET /api/favorites/check/:quoteId
Authorization: Bearer <jwt-token>
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. Register or login to get a JWT token
2. Include the token in the `Authorization` header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

### JWT Token Format
```json
{
  "userId": "user_id_here",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Favorites Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  quoteId: ObjectId (ref: quotes),
  addedAt: Date
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

## Security Features

- **Password Hashing**: Uses bcryptjs with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Email validation, password requirements
- **CORS**: Cross-origin resource sharing enabled
- **Helmet**: Security headers middleware
- **Rate Limiting**: Built-in Express rate limiting

## Frontend Integration (Next.js)

For your Next.js frontend, you can use the API like this:

### Authentication Hook Example
```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
    }
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return { user, token, login, logout };
};
```

### API Client Example
```javascript
// utils/api.js
const API_BASE = 'http://localhost:3000/api';

export const apiClient = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    return response.json();
  },

  // Quotes
  getQuotes: () => apiClient.request('/quotes'),
  getRandomQuote: () => apiClient.request('/quotes/random'),
  
  // Auth
  register: (userData) => apiClient.request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  login: (credentials) => apiClient.request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  // Favorites
  getFavorites: () => apiClient.request('/favorites'),
  addToFavorites: (quoteId) => apiClient.request(`/favorites/${quoteId}`, {
    method: 'POST'
  }),
  removeFromFavorites: (quoteId) => apiClient.request(`/favorites/${quoteId}`, {
    method: 'DELETE'
  })
};
```

## Development

### Running Tests
```bash
npm test
```

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB_NAME`: Database name
- `JWT_SECRET`: Secret key for JWT tokens

## License

MIT License - see LICENSE file for details.

## Author

Max Erfodimo 