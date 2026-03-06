const pool = require('./config/database');
async function test() {
  try {
    const [cols] = await pool.execute('DESCRIBE inventory_tasks');
    console.log('Inventory Tasks columns:', cols.map(c => c.Field));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
test();
