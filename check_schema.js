const pool = require('./backend/config/database');

async function check() {
  try {
    const [rows] = await pool.execute('DESCRIBE root_cards');
    console.log('Root cards schema:');
    rows.forEach(r => console.log(`  ${r.Field}: ${r.Type}`));
    
    const [rows2] = await pool.execute('SELECT id, project_id, code, sales_order_id FROM root_cards LIMIT 5');
    console.log('\nRoot cards data:');
    console.log(JSON.stringify(rows2, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
