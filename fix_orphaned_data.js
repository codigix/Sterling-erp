const pool = require('./backend/config/database');

async function fix() {
  try {
    const targetSoId = 10; // The valid DRDO Sales Order
    
    // 1. Fix work orders pointing to invalid sales order 8
    const [woFix] = await pool.execute('UPDATE work_orders SET sales_order_id = ? WHERE sales_order_id = 8 OR sales_order_id IS NULL', [targetSoId]);
    console.log(`Updated ${woFix.affectedRows} work orders`);

    // 2. Fix employee tasks pointing to invalid sales order 8 or null
    const [taskFix] = await pool.execute('UPDATE employee_tasks SET sales_order_id = ? WHERE sales_order_id = 8 OR sales_order_id IS NULL', [targetSoId]);
    console.log(`Updated ${taskFix.affectedRows} employee tasks`);

    // 3. Ensure work orders are linked to a valid project (Project ID 13 is DRDO)
    const [woProjFix] = await pool.execute('UPDATE work_orders SET project_id = 13 WHERE project_id IS NULL');
    console.log(`Updated ${woProjFix.affectedRows} work orders with project ID 13`);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

fix();
