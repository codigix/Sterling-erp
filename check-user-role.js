const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUserRole() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sterling_erp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('Checking users and their roles...\n');
    
    const [users] = await pool.execute(`
      SELECT u.id, u.username, u.email, u.role_id, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id
    `);

    console.log('Users in database:');
    console.table(users);
    
    console.log('\n\nAvailable roles:');
    const [roles] = await pool.execute(`SELECT id, name FROM roles`);
    console.table(roles);

    console.log('\n\nChecking what "production" role ID is:');
    const [prodRoles] = await pool.execute(`SELECT id, name FROM roles WHERE LOWER(name) LIKE '%production%'`);
    console.table(prodRoles);

    pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    pool.end();
    process.exit(1);
  }
}

checkUserRole();
