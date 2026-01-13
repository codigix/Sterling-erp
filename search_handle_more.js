const pool = require('./backend/config/database');

async function searchHandle() {
  try {
    console.log('Searching for "handle" in more tables...');
    
    const tables = ['outsourcing_tasks', 'manufacturing_stages', 'employee_tasks', 'projects'];
    
    for (const table of tables) {
      console.log(`\n--- Table: ${table} ---`);
      try {
        const [rows] = await pool.execute(`SELECT * FROM ${table}`);
        
        rows.forEach(row => {
          const rowString = JSON.stringify(row).toLowerCase();
          if (rowString.includes('handle')) {
            console.log(`Match in ${table} (ID: ${row.id || 'N/A'}):`);
            console.log(`  Data: ${JSON.stringify(row)}`);
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

searchHandle();
