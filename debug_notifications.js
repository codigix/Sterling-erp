const pool = require('./backend/config/database');

async function test() {
  try {
    const [users] = await pool.execute(`
      SELECT u.id, u.username, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id
    `);
    console.log('ALL USERS AND ROLES:');
    console.log(JSON.stringify(users, null, 2));

    const [notifs] = await pool.execute('SELECT * FROM alerts_notifications ORDER BY created_at DESC LIMIT 5');
    console.log('\nLATEST 5 NOTIFICATIONS:');
    console.log(JSON.stringify(notifs, null, 2));

    // Check specifically for roles we use in the controller
    const [managers] = await pool.execute(`
      SELECT u.id, u.username, r.name as role_name
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE LOWER(r.name) IN ('inventory_manager', 'inventory manager', 'admin', 'administrator', 'inventory', 'procurement')
    `);
    console.log('\nUSERS MATCHING NOTIFICATION ROLES:');
    console.log(JSON.stringify(managers, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

test();
