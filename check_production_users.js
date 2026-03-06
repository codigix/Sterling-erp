const mysql = require('mysql2/promise');

async function checkUsers() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Sterling@123',
    database: 'sterling_erp'
  });

  try {
    const [rows] = await pool.execute(`
      SELECT u.id, u.username, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE LOWER(r.name) = 'production' OR LOWER(r.name) = 'production_manager'
    `);
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

checkUsers();
