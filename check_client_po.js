const pool = require('./backend/config/database');

async function checkClientPO() {
  try {
    const [rows] = await pool.execute('SELECT * FROM client_po_details');
    rows.forEach(row => {
      console.log(`Order #${row.sales_order_id}: ${JSON.stringify(row).substring(0, 200)}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkClientPO();
