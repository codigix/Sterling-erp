const pool = require('./backend/config/database');
async function check() {
  try {
    const [rc] = await pool.execute('SELECT COUNT(*) as count FROM root_cards');
    const [so] = await pool.execute('SELECT COUNT(*) as count FROM sales_orders');
    console.log('root_cards count:', rc[0].count);
    console.log('sales_orders count:', so[0].count);
    
    if (so[0].count > 0) {
        const [so_sample] = await pool.execute('SELECT * FROM sales_orders LIMIT 1');
        console.log('sales_orders sample:', JSON.stringify(so_sample[0], null, 2));
    }
    
    if (rc[0].count > 0) {
        const [rc_sample] = await pool.execute('SELECT * FROM root_cards LIMIT 1');
        console.log('root_cards sample:', JSON.stringify(rc_sample[0], null, 2));
    }
    
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
check();
