const pool = require('./backend/config/database');
async function run() {
  try {
    const [rows] = await pool.execute('DESCRIBE outward_challans');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
