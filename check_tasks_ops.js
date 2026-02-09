const pool = require('./backend/config/database');
async function check() {
  try {
    const [tasks] = await pool.execute('SELECT * FROM employee_tasks WHERE work_order_operation_id IS NOT NULL');
    console.log('Job Card Tasks:', tasks);
    
    const [ops] = await pool.execute('SELECT id, operation_name, operator_id FROM work_order_operations WHERE id >= 100');
    console.log('Operations:', ops);

  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
check();
