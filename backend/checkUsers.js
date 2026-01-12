  const mysql = require('mysql2/promise');
  const path = require('path');
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

(async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sterling_erp'
    });

    const conn = await pool.getConnection();
    
    console.log('Checking users...');
    const [users] = await conn.execute('SELECT id, username, role_id FROM users');
    console.log('Users in database:', users);
    
    console.log('\nChecking roles...');
    const [roles] = await conn.execute('SELECT id, name FROM roles');
    console.log('Roles in database:', roles);
    
    conn.release();
    pool.end();
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
