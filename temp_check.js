const pool = require('./backend/config/database');
async function check() {
  try {
    const [rows] = await pool.execute('DESC work_orders');
    console.log('Work Orders Fields:', rows.map(r => r.Field));
    
    const [rows2] = await pool.execute('DESC work_order_operations');
    console.log('Work Order Operations Fields:', rows2.map(r => r.Field));
    
    const [rows3] = await pool.execute('DESC work_order_inventory');
    console.log('Work Order Inventory Fields:', rows3.map(r => r.Field));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
