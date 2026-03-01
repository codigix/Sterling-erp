const pool = require('./config/database');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const AlertsNotification = require('./models/AlertsNotification');

async function testNotification() {
  try {
    console.log('--- Testing Notification for inventory.manager ---');
    
    const [users] = await pool.execute("SELECT id FROM users WHERE username = 'inventory.manager'");
    if (users.length === 0) {
      console.error('inventory.manager user not found in DB');
      return;
    }
    const userId = users[0].id;
    console.log('Target User ID:', userId);

    const alertId = await AlertsNotification.create({
      userId: 'inventory.manager', // Test with username to see resolution
      message: `TEST ALERT ${new Date().toISOString()}`,
      alertType: 'info',
      priority: 'high'
    });
    
    console.log('Alert created with ID:', alertId);

    const [rows] = await pool.execute('SELECT * FROM alerts_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId]);
    console.log('Alert in DB:', JSON.stringify(rows[0], null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
    process.exit();
  }
}

testNotification();
