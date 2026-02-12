const pool = require('./backend/config/database');
async function check() {
  try {
    console.log('--- Alerts Schema ---');
    const [cols] = await pool.execute('DESCRIBE alerts_notifications');
    console.table(cols);

    console.log('--- Recent Notifications (Last 10 mins) ---');
    const [alerts] = await pool.execute(`
      SELECT * 
      FROM alerts_notifications 
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE)
      ORDER BY created_at DESC
    `);
    console.table(alerts);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();