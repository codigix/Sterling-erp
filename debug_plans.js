const pool = require('./backend/config/database');

async function debug() {
  try {
    console.log('Checking Production Plan 25...');
    const [pp25] = await pool.execute('SELECT * FROM production_plans WHERE id = 25');
    console.log('PP 25:', pp25[0]);

    console.log('\nChecking Production Plan for WO 42...');
    const [wo42] = await pool.execute('SELECT notes FROM work_orders WHERE id = 42');
    const ppCode = wo42[0]?.notes?.match(/PP-\d+/)?.[0];
    if (ppCode) {
        const [pp] = await pool.execute('SELECT * FROM production_plans WHERE plan_code = ?', [ppCode]);
        console.log('PP for WO 42:', pp[0]);
    }

    console.log('\nChecking Projects...');
    const [projects] = await pool.execute('SELECT id, name, code FROM projects');
    console.log('Available Projects:', projects);

    console.log('\nChecking Sales Orders...');
    const [sos] = await pool.execute('SELECT id, po_number, customer, project_name FROM sales_orders');
    console.log('Available Sales Orders:', sos);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

debug();
