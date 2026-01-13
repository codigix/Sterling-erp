const pool = require('./backend/config/database');

async function searchInventory() {
  try {
    console.log('Searching for "handle" in inventory table...');
    const [rows] = await pool.execute('SELECT * FROM inventory');
    rows.forEach(row => {
      const rowString = JSON.stringify(row).toLowerCase();
      if (rowString.includes('handle')) {
        console.log(`Match in inventory (ID: ${row.id}):`);
        console.log(`  Data: ${JSON.stringify(row)}`);
      }
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

searchInventory();
