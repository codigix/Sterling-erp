require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const API_URL = process.env.VITE_API_URL || 'http://localhost:5001';
const axios = require('axios');
const pool = require('./backend/config/database');

async function testWithAuth() {
  try {
    // First, let's create a test token by logging in
    console.log('Testing API with authentication...\n');

    // Get a test user from the database
    const [users] = await pool.execute(
      'SELECT id, email, password_hash FROM users WHERE id = 1 LIMIT 1'
    );

    if (!users.length) {
      console.log('No test user found. Let\'s test without auth first...');
    }

    // Test the API with auth header
    const testToken = 'test-token-will-fail';
    
    try {
      console.log('Testing without token...');
      const response1 = await axios.get(`${API_URL}/api/employee/portal/tasks/18`);
      console.log('Response status:', response1.status);
      console.log('Response data:', response1.data);
    } catch (e) {
      console.log('Error without token:', e.response?.status, e.response?.data);
    }

    // Let's check the actual error from the server
    console.log('\nLet\'s check what auth middleware expects...');
    const response2 = await axios.get(`${API_URL}/api/health`);
    console.log('Health check:', response2.data);

    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

testWithAuth();
