const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sterling_erp'
  });

  try {
    const [rows] = await connection.execute('DESCRIBE work_orders');
    console.log('Columns in work_orders:');
    rows.forEach(row => console.log(`- ${row.Field} (${row.Type})`));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
})();
