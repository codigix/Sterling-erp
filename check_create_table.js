const pool = require('./backend/config/database');
async function checkSchema() {
  try {
    const [rows] = await pool.execute('SHOW CREATE TABLE production_plans');
    console.log('--- production_plans ---');
    console.log(rows[0]['Create Table']);
    
    const [rows2] = await pool.execute('SHOW CREATE TABLE production_plan_fg');
    console.log('--- production_plan_fg ---');
    console.log(rows2[0]['Create Table']);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkSchema();
