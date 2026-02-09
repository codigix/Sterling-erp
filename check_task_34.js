const pool = require('./backend/config/database');

async function debug() {
  try {
    const [rows] = await pool.execute('SELECT * FROM employee_tasks WHERE id = 34');
    console.log('Task 34:', rows[0]);
    
    if (rows[0]) {
        const [ops] = await pool.execute('SELECT * FROM work_order_operations WHERE id = ?', [rows[0].work_order_operation_id]);
        console.log('Operation:', ops[0]);
        
        if (ops[0]) {
            const [wos] = await pool.execute('SELECT * FROM work_orders WHERE id = ?', [ops[0].work_order_id]);
            console.log('Work Order:', wos[0]);
        }
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

debug();
