const pool = require('./backend/config/database');

async function clearSalesOrders() {
  try {
    const [result] = await pool.execute('DELETE FROM sales_orders');
    console.log('✅ Deleted ' + result.affectedRows + ' records from sales_orders table');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

clearSalesOrders();
