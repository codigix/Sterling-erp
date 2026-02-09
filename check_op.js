const pool = require('./backend/config/database');
async function checkOp() {
  try {
    const [ops] = await pool.execute('SELECT * FROM work_order_operations WHERE id = 155');
    console.log('--- Operation 155 ---');
    console.log(JSON.stringify(ops, null, 2));
    
    const [tasks] = await pool.execute('SELECT * FROM employee_tasks WHERE work_order_operation_id = 155');
    console.log('\n--- Tasks for Operation 155 ---');
    console.log(JSON.stringify(tasks, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkOp();
