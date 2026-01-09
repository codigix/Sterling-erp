const pool = require('./config/database');
const jwt = require('jsonwebtoken');
const http = require('http');

async function debugAPI() {
  try {
    console.log('=== Debugging Task API ===\n');

    // Get employee 18
    const [emp] = await pool.execute('SELECT * FROM employees WHERE id = 18');
    const employee = emp[0];
    console.log(`Employee: ${employee.first_name} ${employee.last_name} (ID: ${employee.id})\n`);

    // Create token
    const token = jwt.sign(
      {
        id: employee.id,
        username: employee.login_id,
        role: 'Supervisor',
        type: 'employee'
      },
      process.env.JWT_SECRET || 'sterling_erp_jwt_secret_2024_secure_key',
      { expiresIn: '24h' }
    );

    // Test 1: Check worker tasks in database
    console.log('Test 1: Worker tasks in database');
    const [workerTasks] = await pool.execute(
      'SELECT id, task, status FROM worker_tasks WHERE worker_id = 18'
    );
    console.log(`  Found ${workerTasks.length} worker tasks\n`);

    // Test 2: Check assigned tasks in database
    console.log('Test 2: Assigned tasks in database');
    const [assignedTasks] = await pool.execute(
      'SELECT id, title, type, status, employee_id FROM employee_tasks WHERE employee_id = 18'
    );
    console.log(`  Found ${assignedTasks.length} assigned tasks`);
    if (assignedTasks.length > 0) {
      console.log(`  Sample: ${assignedTasks[0].title} (type: ${assignedTasks[0].type})\n`);
    }

    // Test 3: Call API endpoint
    console.log('Test 3: API endpoint /api/employee/portal/tasks/18');
    await new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 5001,
        path: `/api/employee/portal/tasks/18`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          console.log(`  Status: ${res.statusCode}`);
          try {
            const parsed = JSON.parse(data);
            console.log(`  Response: ${parsed.length} tasks\n`);
            
            // Count by type
            const byType = {};
            parsed.forEach(t => {
              byType[t.taskType || 'unknown'] = (byType[t.taskType || 'unknown'] || 0) + 1;
            });
            console.log(`  Breakdown:`, byType);
          } catch (e) {
            console.log(`  Error parsing response`);
          }
          resolve();
        });
      });
      req.end();
    });

    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

debugAPI();
