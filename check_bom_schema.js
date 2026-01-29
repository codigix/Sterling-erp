const pool = require('./backend/config/database');
async function checkSchema() {
  try {
    const [rows] = await pool.execute('DESCRIBE bill_of_materials');
    console.log('Bill of Materials Table Schema:');
    console.table(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkSchema();
