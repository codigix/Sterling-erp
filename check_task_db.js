
const pool = require('./backend/config/database');

async function check() {
  try {
    const [rows] = await pool.execute('SELECT id, sales_order_id, root_card_id, work_order_operation_id FROM department_tasks WHERE id = 81');
    console.log('Task 81:', rows[0]);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

check();
