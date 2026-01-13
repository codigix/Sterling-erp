const pool = require('./backend/config/database');

async function checkAllDetails() {
  try {
    const [rows] = await pool.execute('SELECT sales_order_id, product_details FROM sales_order_details');
    console.log(`Found ${rows.length} rows in sales_order_details`);
    rows.forEach(row => {
      console.log(`Order #${row.sales_order_id}: ${row.product_details}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAllDetails();
