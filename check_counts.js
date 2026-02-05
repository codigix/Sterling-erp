const pool = require('./backend/config/database');
async function checkData() {
  try {
    const tables = ['production_plans', 'material_requests', 'outsourcing_tasks', 'production_stages', 'production_plan_details', 'production_plan_stages'];
    for (const table of tables) {
      const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`${table}: ${rows[0].count}`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkData();
