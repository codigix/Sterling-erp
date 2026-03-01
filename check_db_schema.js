const pool = require('./backend/config/database');
async function check() {
  try {
    const [cols1] = await pool.execute('DESCRIBE outward_challans');
    console.log('outward_challans:', cols1.map(c => c.Field));
    const [cols2] = await pool.execute('DESCRIBE inward_challans');
    console.log('inward_challans:', cols2.map(c => c.Field));
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
check();
