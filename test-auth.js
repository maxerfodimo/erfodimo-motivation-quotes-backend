const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

let authToken = null;

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Register user
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
    console.log('✅ Registration successful:', registerResponse.data.message);
    authToken = registerResponse.data.token;
    console.log('Token received:', authToken.substring(0, 20) + '...\n');

    // Test 2: Login user
    console.log('2. Testing user login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    authToken = loginResponse.data.token;
    console.log('Token received:', authToken.substring(0, 20) + '...\n');

    // Test 3: Get user profile
    console.log('3. Testing get profile...');
    const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Profile retrieved:', profileResponse.data.user.name);
    console.log('Email:', profileResponse.data.user.email, '\n');

    // Test 4: Get quotes (public endpoint)
    console.log('4. Testing get quotes...');
    const quotesResponse = await axios.get(`${API_BASE}/quotes`);
    console.log('✅ Quotes retrieved:', quotesResponse.data.count, 'quotes');
    
    if (quotesResponse.data.count > 0) {
      const firstQuote = quotesResponse.data.data[0];
      console.log('First quote:', firstQuote.text.substring(0, 50) + '...\n');

      // Test 5: Add quote to favorites
      console.log('5. Testing add to favorites...');
      const addFavoriteResponse = await axios.post(`${API_BASE}/favorites/${firstQuote._id}`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Added to favorites:', addFavoriteResponse.data.message, '\n');

      // Test 6: Get favorites
      console.log('6. Testing get favorites...');
      const favoritesResponse = await axios.get(`${API_BASE}/favorites`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Favorites retrieved:', favoritesResponse.data.favorites.length, 'favorites\n');

      // Test 7: Check if quote is favorite
      console.log('7. Testing check favorite...');
      const checkFavoriteResponse = await axios.get(`${API_BASE}/favorites/check/${firstQuote._id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Check favorite:', checkFavoriteResponse.data.isFavorite ? 'Yes' : 'No', '\n');

      // Test 8: Remove from favorites
      console.log('8. Testing remove from favorites...');
      const removeFavoriteResponse = await axios.delete(`${API_BASE}/favorites/${firstQuote._id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Removed from favorites:', removeFavoriteResponse.data.message, '\n');
    }

    // Test 9: Update profile
    console.log('9. Testing update profile...');
    const updateResponse = await axios.put(`${API_BASE}/auth/profile`, {
      name: 'Updated Test User'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Profile updated:', updateResponse.data.message, '\n');

    // Test 10: Delete user account
    console.log('10. Testing delete account...');
    const deleteResponse = await axios.delete(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Account deleted:', deleteResponse.data.message, '\n');

    console.log('🎉 All tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    console.error('Status:', error.response?.status);
  }
}

// Run the test
testAuth(); 