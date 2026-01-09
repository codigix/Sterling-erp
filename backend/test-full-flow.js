const pool = require('./config/database');
const jwt = require('jsonwebtoken');
const http = require('http');

async function testFullFlow() {
  try {
    console.log('=== Testing Full Authentication and Task Fetch Flow ===\n');

    // Step 1: Get employee data
    console.log('Step 1: Fetching employee data for sudarshan kale...');
    const [employees] = await pool.execute(
      "SELECT * FROM employees WHERE first_name = 'sudarshan' AND last_name = 'kale' LIMIT 1"
    );
    
    if (!employees.length) {
      console.log('ERROR: Employee not found');
      process.exit(1);
    }

    const employee = employees[0];
    console.log(`✓ Found employee: ${employee.first_name} ${employee.last_name} (ID: ${employee.id})`);

    // Step 2: Generate a valid JWT token like the backend would
    console.log('\nStep 2: Generating JWT token...');
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
    console.log(`✓ Generated token for employee ID: ${employee.id}`);

    // Step 3: Call the API with the token
    console.log('\nStep 3: Calling API with token...');
    await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5001,
        path: `/api/employee/portal/tasks/${employee.id}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          console.log(`✓ API Response Status: ${res.statusCode}`);
          try {
            const parsed = JSON.parse(data);
            console.log(`✓ Response contains ${parsed.length || 0} tasks`);
            if (parsed.length > 0) {
              console.log('\n  First 3 tasks:');
              parsed.slice(0, 3).forEach((task, i) => {
                console.log(`\n  Task ${i + 1}:`);
                console.log('    Keys:', Object.keys(task).join(', '));
                if (task.title) console.log('    Title:', task.title);
                if (task.task) console.log('    Task:', task.task);
                if (task.type) console.log('    Type:', task.type);
                if (task.taskType) console.log('    TaskType:', task.taskType);
                if (task.status) console.log('    Status:', task.status);
              });
            } else {
              console.log('\n⚠️  No tasks returned in response');
            }
          } catch (e) {
            console.log('Response (raw):', data);
          }
          resolve();
        });
      });

      req.on('error', (error) => {
        console.error('✗ Request error:', error.message);
        reject(error);
      });

      req.end();
    });

    console.log('\n=== Test Complete ===');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

testFullFlow();
