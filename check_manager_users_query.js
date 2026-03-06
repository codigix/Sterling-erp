const pool = require('./backend/config/database');

async function checkQuery() {
  try {
    const userId = 12; // Sudarshan
    const [managerUsers] = await pool.execute(`
      SELECT DISTINCT u.id 
      FROM users u 
      JOIN roles r ON u.role_id = r.id
      WHERE (LOWER(r.name) = 'production' OR LOWER(r.name) = 'production_manager') AND u.id != ?
    `, [userId]);
    
    console.log("Manager Users:");
    console.log(JSON.stringify(managerUsers, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

checkQuery();
