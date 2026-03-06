const pool = require('./backend/config/database');

async function checkNotifs() {
  try {
    console.log("\n--- User 7 Notifications ---");
    const [notifs] = await pool.execute("SELECT id, user_id, related_id, message FROM alerts_notifications WHERE user_id = 7 ORDER BY id DESC LIMIT 10");
    console.log(JSON.stringify(notifs, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

checkNotifs();
