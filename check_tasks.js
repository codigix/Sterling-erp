const pool = require('./backend/config/database');

async function check() {
  try {
    const [rows] = await pool.execute('SELECT id, task_title, root_card_id, sales_order_id FROM department_tasks LIMIT 5;');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
