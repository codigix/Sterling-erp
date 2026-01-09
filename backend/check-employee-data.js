const pool = require('./config/database');
require('dotenv').config();

async function checkEmployee() {
  try {
    console.log('Checking employee data...\n');

    const [employees] = await pool.execute(`
      SELECT e.id, e.login_id, e.first_name, e.last_name, e.role_id, 
             r.id as role_table_id, r.name as role_name,
             d.id as dept_id, d.name as department_name
      FROM employees e
      LEFT JOIN roles r ON e.role_id = r.id
      LEFT JOIN departments d ON e.department_id = d.id
      ORDER BY e.created_at DESC
      LIMIT 10
    `);

    console.log('Employee Records:');
    console.log('================');
    employees.forEach(emp => {
      console.log(`\nName: ${emp.first_name} ${emp.last_name}`);
      console.log(`  Login ID: ${emp.login_id}`);
      console.log(`  Role ID (in employee): ${emp.role_id}`);
      console.log(`  Role Name: ${emp.role_name}`);
      console.log(`  Department: ${emp.department_name}`);
    });

    console.log('\n\nAvailable Roles:');
    console.log('================');
    const [roles] = await pool.execute('SELECT * FROM roles');
    roles.forEach(role => {
      console.log(`ID: ${role.id}, Name: ${role.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkEmployee();
