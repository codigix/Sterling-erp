const pool = require('./backend/config/database');
async function check() {
  try {
    const [rows] = await pool.execute('DESC sales_order_details');
    console.log('sales_order_details Fields:', rows.map(r => r.Field));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
