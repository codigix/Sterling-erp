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
    const [rows] = await connection.execute(`
      SELECT 
        COLUMN_NAME, 
        CONSTRAINT_NAME, 
        REFERENCED_TABLE_NAME, 
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_NAME = 'production_plans' 
        AND TABLE_SCHEMA = 'sterling_erp'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    console.log('Foreign keys in production_plans:');
    rows.forEach(row => console.log(`- ${row.COLUMN_NAME} references ${row.REFERENCED_TABLE_NAME}(${row.REFERENCED_COLUMN_NAME}) [${row.CONSTRAINT_NAME}]`));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
})();
