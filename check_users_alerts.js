
const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sterling_erp'
  });
  const [users] = await connection.query('SELECT id, username, email, role_id FROM users WHERE username = "production" OR role_id IN (5, 10)');
  console.log('Production Users:', JSON.stringify(users, null, 2));
  
  const [alerts] = await connection.query('SELECT id, user_id, message, is_read, created_at FROM alerts_notifications ORDER BY created_at DESC LIMIT 10');
  console.log('Recent Alerts:', JSON.stringify(alerts, null, 2));
  
  await connection.end();
}
run();
