const pool = require('./backend/config/database');
async function check() {
  try {
    const [[so]] = await pool.execute('SELECT COUNT(*) as count FROM sales_orders');
    const [[p]] = await pool.execute('SELECT COUNT(*) as count FROM projects');
    const [[alert]] = await pool.execute('SELECT COUNT(*) as count FROM alerts_notifications');
    const [[task]] = await pool.execute('SELECT COUNT(*) as count FROM employee_tasks');
    
    console.log('Record Counts:');
    console.log('- Sales Orders (Root Cards):', so.count);
    console.log('- Projects:', p.count);
    console.log('- Notifications (Alerts):', alert.count);
    console.log('- Employee Tasks:', task.count);
    
    // Check for slow joins
    console.log('\nChecking for missing indexes on joins...');
    const [explain] = await pool.execute(`
      EXPLAIN SELECT so.*, p.id as project_id 
      FROM sales_orders so
      LEFT JOIN projects p ON p.sales_order_id = so.id
    `);
    console.table(explain);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
