const pool = require('../config/database');

(async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('DESCRIBE grn');
    console.log('GRN Schema:');
    console.log(JSON.stringify(rows, null, 2));
  } catch(err) {
    console.error('Error:', err.message);
  } finally {
    if(conn) conn.release();
    process.exit();
  }
})();
