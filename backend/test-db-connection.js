require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Config:');
    console.log('  Host:', process.env.DB_HOST);
    console.log('  User:', process.env.DB_USER);
    console.log('  Database:', process.env.DB_NAME);
    console.log('  Password length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);

    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    });

    const conn = await pool.getConnection();
    console.log('✓ Connected to database!');

    // Test a simple query
    const [rows] = await conn.execute('SELECT COUNT(*) as count FROM employee_tasks');
    console.log('✓ Employee tasks count:', rows[0].count);

    conn.release();
    pool.end();
    process.exit(0);
  } catch (e) {
    console.error('✗ Connection error:', e.message);
    process.exit(1);
  }
}

testConnection();
