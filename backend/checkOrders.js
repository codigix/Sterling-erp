const pool = require('./config/database');
require('dotenv').config();

async function checkOrders() {
  const connection = await pool.getConnection();
  
  try {
    const [orders] = await connection.execute('SELECT id, customer, po_number, status, created_at FROM sales_orders ORDER BY id DESC LIMIT 10');
    console.log('Last 10 sales orders:');
    console.table(orders);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

checkOrders();
