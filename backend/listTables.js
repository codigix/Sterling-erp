const mysql = require('mysql2/promise');

(async () => {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'Kale@1234',
      database: 'sterling_erp'
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
