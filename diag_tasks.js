const pool = require('./backend/config/database');

async function check() {
  try {
    const [tasks] = await pool.execute('SELECT * FROM employee_tasks ORDER BY id DESC LIMIT 10');
    console.log('--- RECENT employee_tasks ---');
    console.log(JSON.stringify(tasks, null, 2));

    const [workerTasks] = await pool.execute('SELECT * FROM worker_tasks ORDER BY id DESC LIMIT 10');
    console.log('--- RECENT worker_tasks ---');
    console.log(JSON.stringify(workerTasks, null, 2));

    const [emp] = await pool.execute('SELECT id, first_name, last_name, login_id FROM employees WHERE first_name LIKE "%sudarshan%"');
    console.log('--- SUDARSHAN EMPLOYEE ---');
    console.log(emp);

    if (emp.length > 0) {
        const [empTasks] = await pool.execute('SELECT * FROM employee_tasks WHERE employee_id = ?', [emp[0].id]);
        console.log(`--- TASKS FOR EMPLOYEE ID ${emp[0].id} ---`);
        console.log(empTasks);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
