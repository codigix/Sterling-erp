const pool = require('./backend/config/database');
async function check() {
  try {
    const [rows] = await pool.execute('SELECT * FROM production_plan_details LIMIT 1');
    if (rows.length > 0) {
      console.log('Production Plan Detail:');
      console.log('ID:', rows[0].id);
      console.log('Sales Order ID:', rows[0].sales_order_id);
      console.log('Finished Goods:', rows[0].finished_goods);
      console.log('Sub Assemblies:', rows[0].sub_assemblies);
    } else {
      console.log('No production plan details found.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
check();
