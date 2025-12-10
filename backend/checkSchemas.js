const pool = require('./config/database');

async function checkSchemas() {
  try {
    const tables = [
      'client_po_details',
      'sales_order_details',
      'design_engineering_details',
      'material_requirements_details',
      'production_plan_details',
      'quality_check_details',
      'shipment_details',
      'delivery_details'
    ];

    for (const table of tables) {
      console.log(`\n========== ${table} ==========`);
      try {
        const [columns] = await pool.execute(`DESCRIBE ${table}`);
        columns.forEach(col => {
          console.log(`  ${col.Field.padEnd(30)} ${col.Type.padEnd(30)} ${col.Null} ${col.Default || ''}`);
        });
      } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkSchemas();
