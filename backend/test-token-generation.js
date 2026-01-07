const jwt = require('jsonwebtoken');
const User = require('./models/User');
require('dotenv').config({ path: './../.env' });

const generateToken = (user) => {
  console.log('Generating token for user:', user.username);
  console.log('User object keys:', Object.keys(user));
  console.log('User role_name:', user.role_name);
  
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

async function testTokenGeneration() {
  try {
    console.log('Testing token generation for "production" user...\n');
    
    const user = await User.findByUsername('production');
    
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }

    console.log('User found:', user);
    
    const token = generateToken(user);
    
    console.log('\n✅ Token generated:', token);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('\n✅ Token decoded:');
    console.log(decoded);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testTokenGeneration();
