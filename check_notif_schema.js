const pool = require('./backend/config/database');
async function checkNotifSchema() {
  const [rows] = await pool.execute('DESCRIBE alerts_notifications');
  console.log(rows);
  const [fks] = await pool.execute(`
    SELECT 
        TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
    FROM
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE
        REFERENCED_TABLE_SCHEMA = 'sterling_erp' AND TABLE_NAME = 'alerts_notifications'
  `);
  console.log(fks);
  process.exit(0);
}
checkNotifSchema();
