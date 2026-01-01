const pool = require('../config/database');

(async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('DESCRIBE purchase_orders');
    console.log('Purchase Orders Schema:');
    rows.forEach(row => {
      console.log(`${row.Field} (${row.Type}) - Null: ${row.Null}, Default: ${row.Default}`);
    });
  } catch(err) {
    console.error('Error:', err.message);
  } finally {
    if(conn) conn.release();
    process.exit();
  }
})();
