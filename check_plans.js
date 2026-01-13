const pool = require('./backend/config/database');

async function checkPlans() {
  try {
    const [rows] = await pool.execute('SELECT id, sales_order_id, root_card_id FROM production_plans');
    rows.forEach(row => {
      console.log(`Plan #${row.id}: Order #${row.sales_order_id}, RootCard #${row.root_card_id}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPlans();
