const pool = require('./backend/config/database');

async function checkDetailsContent() {
  try {
    const [rows] = await pool.execute('SELECT sales_order_id, product_details FROM sales_order_details');
    rows.forEach(row => {
      const details = row.product_details;
      console.log(`Order #${row.sales_order_id}:`);
      console.log(JSON.stringify(details, null, 2));
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDetailsContent();
