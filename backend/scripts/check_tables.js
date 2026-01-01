const pool = require('../config/database');

(async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    const tables = await conn.query('SHOW TABLES');
    console.log('All Tables:');
    tables[0].forEach(t => {
      const tableName = Object.values(t)[0];
      console.log('  - ' + tableName);
    });
  } catch(err) {
    console.error('Error:', err.message);
  } finally {
    if(conn) conn.release();
    process.exit();
  }
})();
