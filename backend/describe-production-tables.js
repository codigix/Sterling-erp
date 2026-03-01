const pool = require('./config/database');

async function describe() {
  try {
    const [wo] = await pool.execute('DESCRIBE work_orders');
    console.log('--- WORK_ORDERS ---');
    console.log(JSON.stringify(wo, null, 2));

    const [woo] = await pool.execute('DESCRIBE work_order_operations');
    console.log('\n--- WORK_ORDER_OPERATIONS ---');
    console.log(JSON.stringify(woo, null, 2));

    const [wog] = await pool.execute('DESCRIBE work_order_quality_entries');
    console.log('\n--- WORK_ORDER_QUALITY_ENTRIES ---');
    console.log(JSON.stringify(wog, null, 2));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

describe();
