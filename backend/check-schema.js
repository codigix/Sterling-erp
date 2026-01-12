const pool = require('./config/database');

(async () => {
  try {
    const conn = await pool.getConnection();
    const [cols] = await conn.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'production_plan_stages' AND TABLE_SCHEMA = DATABASE()
      ORDER BY ORDINAL_POSITION
    `);
    console.log('production_plan_stages columns:');
    cols.forEach(c => console.log(`  ${c.COLUMN_NAME}: ${c.COLUMN_TYPE} (NULL:${c.IS_NULLABLE}, KEY:${c.COLUMN_KEY})`));
    conn.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
})();
