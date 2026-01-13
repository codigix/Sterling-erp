const pool = require('./backend/config/database');

async function searchDrafts() {
  try {
    const tables = ['sales_order_drafts', 'sales_order_steps'];
    
    for (const table of tables) {
      console.log(`\n--- Table: ${table} ---`);
      try {
        const [rows] = await pool.execute(`SELECT * FROM ${table}`);
        rows.forEach(row => {
          const rowString = JSON.stringify(row).toLowerCase();
          if (rowString.includes('handle')) {
            console.log(`Match in ${table}:`);
            console.log(`  Data: ${JSON.stringify(row).substring(0, 500)}...`);
          }
        });
      } catch (e) {
        console.log(`Error reading table ${table}: ${e.message}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

searchDrafts();
