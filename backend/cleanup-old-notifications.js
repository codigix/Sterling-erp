const pool = require('./config/database');

async function cleanup() {
  try {
    const conn = await pool.getConnection();
    
    console.log('Deleting all old test notifications...');
    const [result] = await conn.execute(`
      DELETE FROM alerts_notifications
    `);
    
    console.log(`✅ Deleted ${result.affectedRows} notifications`);
    
    conn.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}

cleanup();
