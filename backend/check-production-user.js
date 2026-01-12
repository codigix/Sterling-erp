const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const User = require('./models/User');

async function checkProductionUser() {
  try {
    console.log('Checking "production" user...\n');
    
    const user = await User.findByUsername('production');
    
    console.log('User found:', user);
    console.log('\nUser role_name:', user?.role_name);
    console.log('User permissions:', user?.permissions);
    
    if (!user) {
      console.log('User not found!');
    } else if (!user.role_name) {
      console.log('\n❌ ISSUE FOUND: role_name is NULL or undefined!');
    } else {
      console.log('\n✅ User has role:', user.role_name);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkProductionUser();
