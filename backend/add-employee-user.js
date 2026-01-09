const pool = require('./config/database');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    console.log('Creating user account for sudarshan kale...');
    
    const hashedPassword = await bcrypt.hash('temp@123', 10);
    
    const [result] = await pool.execute(`
      INSERT INTO users (username, email, password, role_id, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [
      'sudarshan.kale',
      'kalesudarshan146@gmail.com',
      hashedPassword,
      1
    ]);
    
    const newUserId = result.insertId;
    console.log('✅ User created with ID: ' + newUserId);
    console.log('   Username: sudarshan.kale');
    console.log('   Email: kalesudarshan146@gmail.com');
    console.log('   Role: Employee (role_id = 1)');
    console.log('   Temporary Password: temp@123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
