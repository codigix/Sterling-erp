const pool = require('./backend/config/database');

async function fix() {
  try {
    const [result] = await pool.execute('UPDATE alerts_notifications SET link = ? WHERE link = ?', ['/employee/tasks', '/employee/portal/tasks']);
    console.log(`Updated ${result.affectedRows} notification links`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

fix();
