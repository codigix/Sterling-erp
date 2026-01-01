const pool = require('./config/database');

async function checkTable() {
  try {
    const [rows] = await pool.execute("SHOW TABLES LIKE 'grn'");
    if (rows.length > 0) {
      console.log('Table grn exists.');
    } else {
      console.log('Table grn DOES NOT exist.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkTable();
