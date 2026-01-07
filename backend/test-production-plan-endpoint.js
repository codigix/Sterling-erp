const jwt = require('jsonwebtoken');
const http = require('http');
const User = require('./models/User');
require('dotenv').config({ path: './../.env' });

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role_name,
      permissions: user.permissions
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

async function testEndpoint() {
  try {
    console.log('Testing production-plan endpoint with "production" user...\n');
    
    const user = await User.findByUsername('production');
    
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }

    const token = generateToken(user);
    
    console.log('Generated token with role:', user.role_name);
    console.log('\nMaking request to: POST /api/sales/steps/1/production-plan');
    
    const postData = JSON.stringify({
      salesOrderId: 1,
      planName: 'Test Production Plan'
    });

    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/sales/steps/1/production-plan',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\nStatus Code:', res.statusCode);
        console.log('Response:', data);
        
        if (res.statusCode === 403) {
          console.log('\n❌ Permission denied. Checking middleware...');
        } else if (res.statusCode === 200) {
          console.log('\n✅ SUCCESS!');
        }
        
        process.exit(0);
      });
    });

    req.on('error', (error) => {
      console.error('\n❌ Request error:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.log('\n⚠️  Server is not running on port 5001');
      }
      process.exit(1);
    });

    req.write(postData);
    req.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testEndpoint();
