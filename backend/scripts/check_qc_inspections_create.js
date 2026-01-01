const pool = require('../config/database');

(async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query('SHOW CREATE TABLE qc_inspections');
    console.log(result[0][0]['Create Table']);
  } catch(err) {
    console.error('Error:', err.message);
  } finally {
    if(conn) conn.release();
    process.exit();
  }
})();
