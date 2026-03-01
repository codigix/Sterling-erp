const pool = require('./config/database');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const MaterialRequest = require('./models/MaterialRequest');

async function checkUsers() {
  try {
    const [users] = await pool.execute(`
      SELECT u.id, u.username, r.name as role 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id
    `);
    console.log('--- Users in Database ---');
    console.log(JSON.stringify(users, null, 2));
    
    try {
      const [fks] = await pool.execute(`
        SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'alerts_notifications'
      `);
      console.log('\n--- Foreign Keys ---');
      console.log(JSON.stringify(fks, null, 2));

      const [cols] = await pool.execute('DESCRIBE alerts_notifications');
      console.log('\n--- Alerts Schema ---');
      console.log(JSON.stringify(cols, null, 2));
      
      const [rows] = await pool.execute('SELECT * FROM alerts_notifications ORDER BY created_at DESC');
      console.log('\n--- All Alerts ---');
      console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
      console.log('\nError checking alerts:', e.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
    process.exit();
  }
}

checkUsers();
