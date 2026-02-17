const pool = require('./config/database');
async function check() {
  try {
    const [so] = await pool.execute('SELECT * FROM sales_orders WHERE id = 11');
    console.log('Sales Order 11:', JSON.stringify(so, null, 2));
    
    const [pp] = await pool.execute('SELECT * FROM production_plans WHERE sales_order_id = 11');
    console.log('Production Plans for SO 11:', JSON.stringify(pp, null, 2));

    const [allPp] = await pool.execute('SELECT id, plan_name FROM production_plans');
    console.log('All Production Plan IDs/Names:', JSON.stringify(allPp, null, 2));

    const [allPpd] = await pool.execute('SELECT id, production_plan_id, sales_order_id, root_card_id FROM production_plan_details');
    console.log('All Production Plan Details IDs:', JSON.stringify(allPpd, null, 2));

  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
check();
