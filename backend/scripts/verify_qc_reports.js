const pool = require('../config/database');

(async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query('DESCRIBE qc_reports');
    console.log('✓ qc_reports table exists');
    console.log('Columns:');
    result.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
  } catch(err) {
    console.error('✗ Error:', err.message);
  } finally {
    if(conn) conn.release();
    process.exit();
  }
})();
