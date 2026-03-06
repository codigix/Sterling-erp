const EmployeeTask = require('./backend/models/EmployeeTask');
const pool = require('./backend/config/database');

async function testInsert() {
  try {
    console.log('Attempting to create a test task for Sudarshan (employee_id: 4)...');
    
    // We'll use employee_id 4 directly
    const taskId = await EmployeeTask.createAssignedTask(4, {
      title: 'TEST TASK - PLEASE IGNORE',
      description: 'Diagnostic task to check visibility',
      type: 'job_card',
      priority: 'high',
      notes: 'Created via diagnostic script'
    });

    console.log('Successfully created task with ID:', taskId);

    const [rows] = await pool.execute('SELECT * FROM employee_tasks WHERE id = ?', [taskId]);
    console.log('Inserted row from DB:', rows[0]);

    process.exit(0);
  } catch (err) {
    console.error('FAILED to create task:', err);
    process.exit(1);
  }
}

testInsert();
