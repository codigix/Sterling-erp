const pool = require('./backend/config/database');

async function fix() {
  try {
    const [tasks] = await pool.execute(`
      SELECT et.id, woo.work_order_id, wo.sales_order_id 
      FROM employee_tasks et
      JOIN work_order_operations woo ON et.work_order_operation_id = woo.id
      JOIN work_orders wo ON woo.work_order_id = wo.id
      WHERE et.sales_order_id IS NULL AND et.work_order_operation_id IS NOT NULL
    `);
    
    console.log(`Found ${tasks.length} tasks to fix`);
    
    for (const task of tasks) {
      if (task.sales_order_id) {
        await pool.execute('UPDATE employee_tasks SET sales_order_id = ? WHERE id = ?', [task.sales_order_id, task.id]);
        console.log(`Fixed task ${task.id} with sales_order_id ${task.sales_order_id}`);
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

fix();
