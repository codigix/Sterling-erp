const pool = require('./config/database');

async function checkSchema() {
  try {
    // Check the users table columns
    const [userCols] = await pool.execute(
      "DESCRIBE users"
    );
    
    console.log('Users table columns:');
    console.log(userCols);

    // Check employees table columns
    const [empCols] = await pool.execute(
      "DESCRIBE employees"
    );
    
    console.log('\nEmployees table columns:');
    console.log(empCols);

    // Get users
    const [users] = await pool.execute('SELECT * FROM users LIMIT 3');
    console.log('\nSample users:');
    console.log(users);

    // Get employees with ID 18
    const [emp18] = await pool.execute('SELECT * FROM employees WHERE id = 18');
    console.log('\nEmployee ID 18:');
    console.log(emp18);

    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

checkSchema();
