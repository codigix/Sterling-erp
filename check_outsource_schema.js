const pool = require('./backend/config/database');
async function checkSchema() {
  const tables = ['outward_challans', 'outward_challan_items', 'inward_challans', 'inward_challan_items'];
  for (const table of tables) {
    console.log(`--- ${table} ---`);
    const [rows] = await pool.execute(`DESCRIBE ${table}`);
    console.log(rows.map(r => `${r.Field}: ${r.Type}`).join('\n'));
  }
  process.exit(0);
}
checkSchema();
