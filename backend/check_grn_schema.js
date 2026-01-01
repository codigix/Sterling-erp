const db = require('./config/database');

async function checkSchema() {
  const conn = await db.getConnection();
  try {
    const [rows] = await conn.query("DESCRIBE grn");
    console.table(rows);
  } catch (error) {
    console.error('Error describing table:', error);
  } finally {
    conn.release();
    process.exit(0);
  }
}

checkSchema();
