const pool = require('./backend/config/database');

async function check() {
  try {
    await pool.execute('UPDATE sales_orders SET current_step = 2 WHERE id = 9');
    console.log('Updated sales_order 9 to current_step 2');

    const [rows] = await pool.execute('SELECT id, project_name, current_step, workflow_status FROM sales_orders');
    console.log('Sales Orders:', rows);
    
    const [designProjects] = await pool.execute('SELECT id, project_name FROM design_projects');
    console.log('Design Projects:', designProjects);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
