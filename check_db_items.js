const pool = require('./backend/config/database');

async function checkInventory() {
  try {
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM inventory');
    console.log(`Total items in inventory table: ${rows[0].count}`);
    
    const [samples] = await pool.execute('SELECT id, item_code, item_name, created_at FROM inventory LIMIT 10');
    console.log('Sample items in database:');
    console.table(samples);
    
    if (rows[0].count > 0) {
      console.log('\nThese items exist in your "inventory" table, which is the master list of all materials.');
      console.log('Even if the stock balance is 0.000, the material definitions themselves are showing up.');
    }
  } catch (error) {
    console.error('Error checking inventory:', error);
  } finally {
    process.exit(0);
  }
}

checkInventory();
