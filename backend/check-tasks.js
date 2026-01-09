const pool = require('./config/database');

async function checkTasks() {
  try {
    const [rows] = await pool.execute(
      'SELECT id, employee_id, title, type, status FROM employee_tasks WHERE employee_id = 18'
    );
    console.log('Employee tasks for ID 18:');
    console.log(rows);
    
    const [allTasks] = await pool.execute('SELECT COUNT(*) as count FROM employee_tasks');
    console.log('\nTotal tasks in database:', allTasks[0].count);
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

checkTasks();
