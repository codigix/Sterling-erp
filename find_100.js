const pool = require('./backend/config/database');
async function run() {
  try {
    const [ops] = await pool.execute('SELECT id, operation_name, work_order_id, operator_id FROM work_order_operations WHERE id = 100');
    console.log('Searching for Operation 100:');
    console.table(ops);
    
    if (ops.length === 0) {
      const [all] = await pool.execute('SELECT id, operation_name FROM work_order_operations WHERE operation_name LIKE "%Material Prep%"');
      console.log('All Material Prep operations:');
      console.table(all);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
