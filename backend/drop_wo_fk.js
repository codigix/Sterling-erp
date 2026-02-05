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
    console.log('Dropping foreign key constraint work_orders_ibfk_1...');
    await connection.execute('ALTER TABLE work_orders DROP FOREIGN KEY work_orders_ibfk_1');
    console.log('✅ Foreign key dropped successfully');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
})();
