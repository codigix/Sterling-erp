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
    const [rows] = await conn.execute('DESCRIBE sales_orders');
    console.log('Sales Orders Table Columns:');
    rows.forEach(row => console.log('  -', row.Field));
    conn.release();
    pool.end();
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
