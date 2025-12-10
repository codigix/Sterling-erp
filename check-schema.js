const pool = require('./backend/config/database');

async function checkSchema() {
  try {
    const [columns] = await pool.execute('DESCRIBE sales_orders');
    console.log('Current sales_orders columns:');
    const columnNames = columns.map(col => col.Field);
    
    columnNames.forEach(name => {
      console.log('  - ' + name);
    });

    const hasAssignedTo = columnNames.includes('assigned_to');
    const hasAssignedAt = columnNames.includes('assigned_at');

    console.log('\nneeds assigned_to:', !hasAssignedTo);
    console.log('needs assigned_at:', !hasAssignedAt);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkSchema();
