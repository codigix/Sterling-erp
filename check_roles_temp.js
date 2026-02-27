const pool = require('./backend/config/database');
async function checkData() {
  try {
    const [users] = await pool.execute(`
      SELECT u.username, r.name as role_name 
      FROM users u 
      INNER JOIN roles r ON u.role_id = r.id
    `);
    console.log('Users and Roles:', JSON.stringify(users, null, 2));
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
checkData();
