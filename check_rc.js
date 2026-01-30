const pool = require('./backend/config/database');
async function check() {
  try {
    const [rows] = await pool.execute(`
      SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'sterling_erp' AND TABLE_NAME = 'bill_of_materials' AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    console.log('BOM Foreign Keys:', JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
check();
