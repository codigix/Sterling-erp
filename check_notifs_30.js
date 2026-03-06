const pool = require('./backend/config/database');

async function checkNotifs() {
  try {
    console.log("\n--- Last 30 Notifications ---");
    const [notifs] = await pool.execute("SELECT id, user_id, message, created_at FROM alerts_notifications ORDER BY id DESC LIMIT 30");
    console.log(JSON.stringify(notifs, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

checkNotifs();
