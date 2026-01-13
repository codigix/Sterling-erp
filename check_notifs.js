const pool = require('./backend/config/database');

async function checkNotifications() {
  try {
    const [rows] = await pool.execute('SELECT id, message FROM alerts_notifications WHERE message LIKE "%handle%"');
    console.log(`Found ${rows.length} notifications with "handle"`);
    rows.forEach(row => {
      console.log(`Notification #${row.id}: ${row.message}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkNotifications();
