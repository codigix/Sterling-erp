const pool = require('./backend/config/database');

async function checkAllOrders() {
  try {
    const [rows] = await pool.execute('SELECT id, items FROM sales_orders');
    rows.forEach(row => {
      let items = [];
      try {
        items = typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []);
      } catch (e) {
        items = [];
      }
      console.log(`Order #${row.id}: ${items[0]?.name || 'N/A'}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAllOrders();
