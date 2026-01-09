const pool = require('./config/database');

async function checkUsers() {
  try {
    // Check the users table
    const [users] = await pool.execute(
      "SELECT id, first_name, last_name, email FROM users WHERE LOWER(CONCAT(first_name, ' ', last_name)) LIKE '%sudarshan%' OR LOWER(email) LIKE '%sudarshan%' LIMIT 5"
    );
    
    console.log('Users with sudarshan:');
    console.log(users);

    // Check employees table
    const [employees] = await pool.execute(
      "SELECT id, first_name, last_name, email FROM employees WHERE LOWER(CONCAT(first_name, ' ', last_name)) LIKE '%sudarshan%' OR LOWER(email) LIKE '%sudarshan%' LIMIT 5"
    );
    
    console.log('\nEmployees with sudarshan:');
    console.log(employees);

    // Check if user_id 18 exists in users table
    const [user18] = await pool.execute(
      'SELECT id, first_name, last_name, email FROM users WHERE id = 18'
    );
    
    console.log('\nUser ID 18:');
    console.log(user18);

    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

checkUsers();
