const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function cleanupData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sterling_erp',
    multipleStatements: true
  });

  try {
    console.log('Starting comprehensive data cleanup...');

    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    const tablesToClear = [
      'material_request_items',
      'material_requests',
      'quotation_communications',
      'quotations',
      'purchase_order_communications',
      'purchase_orders',
      'grn',
      'stock_entries',
      'material_stock',
      'inventory'
    ];

    for (const table of tablesToClear) {
      try {
        const [rows] = await connection.query(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          console.log(`Clearing table: ${table}`);
          await connection.query(`TRUNCATE TABLE ${table}`);
        } else {
          console.log(`Table ${table} does not exist, skipping.`);
        }
      } catch (err) {
        console.error(`Error clearing table ${table}:`, err.message);
      }
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Comprehensive data cleanup completed successfully.');

  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await connection.end();
    process.exit();
  }
}

cleanupData();
