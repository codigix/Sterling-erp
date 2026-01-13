const pool = require('./backend/config/database');

async function searchHandle() {
  try {
    console.log('Searching for "handle" in all tables...');
    
    const tables = ['sales_orders', 'sales_order_details', 'root_cards', 'department_tasks', 'production_plans', 'production_plan_stages'];
    
    for (const table of tables) {
      console.log(`\n--- Table: ${table} ---`);
      const [rows] = await pool.execute(`SELECT * FROM ${table}`);
      
      rows.forEach(row => {
        const rowString = JSON.stringify(row).toLowerCase();
        if (rowString.includes('handle')) {
          console.log(`Match in ${table} (ID: ${row.id || 'N/A'}):`);
          // Print relevant fields
          if (row.items) console.log(`  items: ${row.items}`);
          if (row.product_details) console.log(`  product_details: ${row.product_details}`);
          if (row.itemName) console.log(`  itemName: ${row.itemName}`);
          if (row.product_name) console.log(`  product_name: ${row.product_name}`);
          if (row.title) console.log(`  title: ${row.title}`);
          if (row.task_title) console.log(`  task_title: ${row.task_title}`);
        }
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

searchHandle();
