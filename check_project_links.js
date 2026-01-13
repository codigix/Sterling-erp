const pool = require('./backend/config/database');

async function checkProjectLinks() {
  try {
    const [rows] = await pool.execute('SELECT id, sales_order_id, name FROM projects');
    rows.forEach(row => {
      console.log(`Project #${row.id}: Order #${row.sales_order_id}, name = "${row.name}"`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProjectLinks();
