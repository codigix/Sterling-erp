const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sterling_erp'
    });
    const [rows] = await conn.execute('SELECT id, product_name, item_code, total_cost, item_group FROM bill_of_materials');
    console.log(JSON.stringify(rows));
    await conn.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
