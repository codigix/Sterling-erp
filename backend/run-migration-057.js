const { createSalesManagementTable } = require('./migrations/057_create_sales_orders_management');

async function run() {
  try {
    await createSalesManagementTable();
    console.log('Migration 057 completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration 057 failed:', error);
    process.exit(1);
  }
}

run();
