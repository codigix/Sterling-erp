  const mysql = require('mysql2/promise');

(async () => {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'sterling_erp'
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
