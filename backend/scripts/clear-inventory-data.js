const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.development') });

async function clearInventoryData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('--- Database Cleanup Started ---');

  try {
    // Disable foreign key checks to allow truncation
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    const tables = [
      'material_stock',
      'stock_entries',
      'grn_items',
      'grn',
      'purchase_order_items',
      'purchase_orders',
      'material_request_items',
      'material_requests',
      'inventory'
    ];

    for (const table of tables) {
      console.log(`Clearing table: ${table}...`);
      await connection.query(`TRUNCATE TABLE ${table}`);
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('--- Database Cleanup Completed Successfully ---');
    console.log('All test inventory, orders, and stock records have been removed.');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await connection.end();
  }
}

clearInventoryData();
