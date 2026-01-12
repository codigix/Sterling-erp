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
    
    const [tables] = await conn.execute('SHOW TABLES');
    console.log('Tables in sterling_erp database:');
    tables.forEach((row, i) => {
      console.log(`${i+1}. ${Object.values(row)[0]}`);
    });
    
    conn.release();
    pool.end();
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
