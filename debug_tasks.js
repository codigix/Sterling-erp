const pool = require('./backend/config/database');

async function debug() {
  try {
    const [tasks] = await pool.execute('SELECT * FROM employee_tasks');
    console.log('Total tasks in employee_tasks:', tasks.length);
    console.log('Tasks:', JSON.stringify(tasks, null, 2));
    
    const [employees] = await pool.execute('SELECT id, first_name, last_name FROM employees');
    console.log('Employees:', JSON.stringify(employees, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debug();
