const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, './.env') });

(async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'sterling_erp'
    });
    const [rows] = await pool.execute('SELECT id, po_number FROM sales_orders WHERE id = 8');
    console.log(JSON.stringify(rows, null, 2));
    await pool.end();
  } catch (e) {
    console.error(e);
  }
})();
