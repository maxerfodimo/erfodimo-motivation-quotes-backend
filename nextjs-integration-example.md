# Next.js Integration Guide

This guide shows how to integrate the Motivation Quotes Backend API with your Next.js frontend.

## Setup

### 1. Environment Variables

Create a `.env.local` file in your Next.js project:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 2. API Client

Create `utils/api.js`:

```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

class ApiClient {
  constructor() {
    this.baseURL = API_BASE;
  }

  async request(endpoint, options = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(updateData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  async deleteProfile() {
    return this.request('/auth/profile', {
      method: 'DELETE'
    });
  }

  // Quotes methods
  async getQuotes() {
    return this.request('/quotes');
  }

  async getRandomQuote() {
    return this.request('/quotes/random');
  }

  async getQuoteById(id) {
    return this.request(`/quotes/${id}`);
  }

  async getQuotesByCategory(category) {
    return this.request(`/quotes/category/${category}`);
  }

  // Favorites methods
  async getFavorites() {
    return this.request('/favorites');
  }

  async addToFavorites(quoteId) {
    return this.request(`/favorites/${quoteId}`, {
      method: 'POST'
    });
  }

  async removeFromFavorites(quoteId) {
    return this.request(`/favorites/${quoteId}`, {
      method: 'DELETE'
    });
  }

  async checkFavorite(quoteId) {
    return this.request(`/favorites/check/${quoteId}`);
  }
}

export const apiClient = new ApiClient();
```

### 3. Authentication Context

Create `contexts/AuthContext.js`:

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app load
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.getProfile();
      setUser(response.user);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiClient.register(userData);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await apiClient.login(credentials);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (updateData) => {
    try {
      await apiClient.updateProfile(updateData);
      await fetchUserProfile(); // Refresh user data
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteAccount = async () => {
    try {
      await apiClient.deleteProfile();
      logout();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    updateProfile,
    deleteAccount,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 4. Favorites Hook

Create `hooks/useFavorites.js`:

```javascript
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';

export const useFavorites = () => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await apiClient.getFavorites();
      setFavorites(response.favorites);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (quoteId) => {
    if (!isAuthenticated) return { success: false, error: 'Not authenticated' };
    
    try {
      await apiClient.addToFavorites(quoteId);
      await fetchFavorites(); // Refresh favorites
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const removeFromFavorites = async (quoteId) => {
    if (!isAuthenticated) return { success: false, error: 'Not authenticated' };
    
    try {
      await apiClient.removeFromFavorites(quoteId);
      await fetchFavorites(); // Refresh favorites
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const checkFavorite = async (quoteId) => {
    if (!isAuthenticated) return false;
    
    try {
      const response = await apiClient.checkFavorite(quoteId);
      return response.isFavorite;
    } catch (error) {
      console.error('Failed to check favorite:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated]);

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    checkFavorite,
    refreshFavorites: fetchFavorites
  };
};
```

### 5. Components Example

#### Login Component

```javascript
// components/LoginForm.js
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login({ email, password });
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

#### Quote Card Component

```javascript
// components/QuoteCard.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';

export const QuoteCard = ({ quote }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      checkFavoriteStatus();
    }
  }, [isAuthenticated, quote._id]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await apiClient.checkFavorite(quote._id);
      setIsFavorite(response.isFavorite);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      alert('Please login to save favorites');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await apiClient.removeFromFavorites(quote._id);
        setIsFavorite(false);
      } else {
        await apiClient.addToFavorites(quote._id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 shadow-sm">
      <blockquote className="text-lg italic mb-4">
        "{quote.text}"
      </blockquote>
      <footer className="text-sm text-gray-600">
        — {quote.author}
      </footer>
      {isAuthenticated && (
        <button
          onClick={toggleFavorite}
          disabled={loading}
          className={`mt-4 px-4 py-2 rounded-md ${
            isFavorite 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } disabled:opacity-50`}
        >
          {loading ? '...' : isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
        </button>
      )}
    </div>
  );
};
```

### 6. App Layout

```javascript
// pages/_app.js
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
```

### 7. Protected Route Component

```javascript
// components/ProtectedRoute.js
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
};
```

## Usage Examples

### Home Page with Quotes

```javascript
// pages/index.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { QuoteCard } from '../components/QuoteCard';
import { apiClient } from '../utils/api';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const response = await apiClient.getQuotes();
      setQuotes(response.data);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading quotes...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Motivation Quotes</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quotes.map((quote) => (
          <QuoteCard key={quote._id} quote={quote} />
        ))}
      </div>
    </div>
  );
}
```

### Favorites Page

```javascript
// pages/favorites.js
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useFavorites } from '../hooks/useFavorites';
import { QuoteCard } from '../components/QuoteCard';

export default function Favorites() {
  return (
    <ProtectedRoute>
      <FavoritesContent />
    </ProtectedRoute>
  );
}

function FavoritesContent() {
  const { favorites, loading } = useFavorites();

  if (loading) {
    return <div>Loading favorites...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Favorite Quotes</h1>
      {favorites.length === 0 ? (
        <p className="text-gray-600">No favorite quotes yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => (
            <QuoteCard key={favorite._id} quote={favorite} />
          ))}
        </div>
      )}
    </div>
  );
}
```

## Error Handling

The API client includes error handling, but you might want to add a global error handler:

```javascript
// utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.message.includes('401') || error.message.includes('403')) {
    // Handle authentication errors
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  
  // Show user-friendly error message
  return error.message || 'Something went wrong';
};
```

## Security Considerations

1. **Token Storage**: Store JWT tokens in localStorage (for simplicity) or httpOnly cookies (more secure)
2. **Token Expiration**: Handle token expiration gracefully
3. **CORS**: Ensure your backend CORS settings allow your Next.js domain
4. **Environment Variables**: Never expose sensitive data in client-side code

## Testing

You can test the integration using the provided test script:

```bash
# Start your backend
npm run dev

# In another terminal, run the test
node test-auth.js
```

This integration provides a complete authentication and favorites system for your Next.js frontend! 