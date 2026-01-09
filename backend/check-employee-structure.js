const pool = require('./config/database');

(async () => {
  try {
    console.log('=== USERS TABLE ===');
    const [users] = await pool.execute('SELECT id, username, email FROM users ORDER BY id LIMIT 15');
    console.log(JSON.stringify(users, null, 2));
    
    console.log('\n=== EMPLOYEES TABLE ===');
    const [employees] = await pool.execute(`
      SELECT e.id, e.first_name, e.last_name, e.email, d.name as department
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      ORDER BY e.id LIMIT 15
    `);
    console.log(JSON.stringify(employees, null, 2));
    
    console.log('\n=== PRODUCTION_PLAN_STAGES FOREIGN KEY ===');
    const [fkInfo] = await pool.execute(`
      SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_NAME = 'production_plan_stages' AND COLUMN_NAME = 'assigned_employee_id'
    `);
    console.log(JSON.stringify(fkInfo, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
