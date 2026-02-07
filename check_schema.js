
const pool = require('./backend/config/database');

async function checkSchema() {
  try {
    const [columns] = await pool.execute('DESC employee_tasks');
    console.log(JSON.stringify(columns, null, 2));
    
    const [allTasks] = await pool.execute('SELECT * FROM employee_tasks WHERE employee_id = 21');
    console.log('All Tasks for Employee 21:', JSON.stringify(allTasks, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkSchema();
