const pool = require('./backend/config/database');
const SalesOrderStep = require('./backend/models/SalesOrderStep');

async function populateSteps() {
  try {
    console.log('Initializing steps for all Sales Orders without steps...');
    
    const [salesOrders] = await pool.execute(`
      SELECT DISTINCT so.id, so.po_number
      FROM sales_orders so
      LEFT JOIN sales_order_steps sos ON so.id = sos.sales_order_id
      WHERE sos.id IS NULL
    `);

    console.log(`Found ${salesOrders.length} Sales Orders without steps`);

    for (const so of salesOrders) {
      console.log(`Initializing steps for Sales Order ID: ${so.id} (${so.po_number})`);
      await SalesOrderStep.initializeAllSteps(so.id);
    }

    console.log('\nVerifying steps were created...');
    const [steps] = await pool.execute(`
      SELECT sales_order_id, COUNT(*) as step_count
      FROM sales_order_steps
      GROUP BY sales_order_id
    `);
    
    console.log('\nSteps by Sales Order:');
    console.log(JSON.stringify(steps, null, 2));

    await pool.end();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

populateSteps();
