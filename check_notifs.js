const pool = require('./backend/config/database');

async function debug() {
  try {
    const [rows] = await pool.execute('SELECT * FROM alerts_notifications WHERE user_id = 12');
    console.log('Notifications for User 12:', rows.length);
    if (rows.length > 0) {
        console.log('Sample notification:', rows[0]);
    }
    
    const [rows21] = await pool.execute('SELECT * FROM alerts_notifications WHERE user_id = 21');
    console.log('Notifications for User 21:', rows21.length);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

debug();
