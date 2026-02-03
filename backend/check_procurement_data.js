const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'backend/.env' });

async function checkData() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sterling_erp'
    });

    const [material_requests_cols] = await conn.execute('DESCRIBE material_requests');
    const [purchase_orders_cols] = await conn.execute('DESCRIBE purchase_orders');
    const [quotations_cols] = await conn.execute('DESCRIBE quotations');

    console.log('material_requests cols:', material_requests_cols.map(c => c.Field));
    console.log('purchase_orders cols:', purchase_orders_cols.map(c => c.Field));
    console.log('quotations cols:', quotations_cols.map(c => c.Field));

    await conn.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkData();
