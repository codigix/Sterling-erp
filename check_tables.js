const pool = require('./backend/config/database');
async function check() {
  try {
    const [mr] = await pool.query('DESCRIBE material_requests');
    console.log('MR Schema:');
    console.table(mr);
    const [po] = await pool.query('DESCRIBE purchase_orders');
    console.log('PO Schema:');
    console.table(po);
    const [roles] = await pool.query('SELECT * FROM roles');
    console.log('Roles:');
    console.table(roles);
    const [users] = await pool.query('SELECT u.username, r.name as role FROM users u JOIN roles r ON u.role_id = r.id');
    console.log('Users:');
    console.table(users);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
check();
