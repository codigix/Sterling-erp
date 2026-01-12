const pool = require('./config/database');
const bcrypt = require('bcryptjs');
const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.PORT || 5001;

async function testLogin() {
  try {
    console.log('=== Testing Login Flow ===\n');

    // Get employee data
    const [emp] = await pool.execute('SELECT * FROM employees WHERE id = 18');
    const employee = emp[0];
    
    console.log(`Employee found:`);
    console.log(`  Name: ${employee.first_name} ${employee.last_name}`);
    console.log(`  Login ID: ${employee.login_id}`);
    console.log(`  Email: ${employee.email}\n`);

    // Test login with correct credentials
    console.log('Test: POST /api/auth/login with sudarshan.kale\n');
    
    await new Promise((resolve) => {
      const loginData = JSON.stringify({
        username: 'sudarshan.kale',
        password: 'password123'  // Try common password
      });

      const options = {
        hostname: API_HOST,
        port: API_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          console.log(`Status: ${res.statusCode}`);
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode === 200) {
              console.log(`✓ Login successful!`);
              console.log(`  User ID: ${parsed.user.id}`);
              console.log(`  User Type: ${parsed.user.type}`);
              console.log(`  Name: ${parsed.user.name}`);
            } else {
              console.log(`✗ Login failed: ${parsed.message}\n`);
              
              // Try with password123
              console.log('Trying with password: password123\n');
            }
          } catch (e) {
            console.log(`Response:`, data);
          }
          resolve();
        });
      });

      req.write(loginData);
      req.end();
    });

    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

testLogin();
