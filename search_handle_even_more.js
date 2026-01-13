const pool = require('./backend/config/database');

async function searchHandleMore() {
  try {
    const tables = ['production_plan_details', 'design_engineering_details', 'client_po_details', 'material_requirements_details', 'quality_check_details', 'shipment_details', 'delivery_details'];
    
    for (const table of tables) {
      console.log(`\n--- Table: ${table} ---`);
      try {
        const [rows] = await pool.execute(`SELECT * FROM ${table}`);
        rows.forEach(row => {
          const rowString = JSON.stringify(row).toLowerCase();
          if (rowString.includes('handle')) {
            console.log(`Match in ${table}:`);
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

searchHandleMore();
