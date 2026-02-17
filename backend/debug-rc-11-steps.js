const pool = require('./config/database');
async function check() {
  try {
    const soId = 11;
    const [ppd] = await pool.execute('SELECT * FROM production_plan_details WHERE sales_order_id = 11');
    console.log('Production Plan Details:', JSON.stringify(ppd, null, 2));

    const [ded] = await pool.execute('SELECT * FROM design_engineering_details WHERE sales_order_id = 11');
    console.log('Design Engineering Details:', JSON.stringify(ded, null, 2));

    const [mrd] = await pool.execute('SELECT * FROM material_requirements_details WHERE sales_order_id = 11');
    console.log('Material Requirements Details:', JSON.stringify(mrd, null, 2));

    const [steps] = await pool.execute('SELECT * FROM sales_order_steps WHERE sales_order_id = 11');
    console.log('Sales Order Steps:', JSON.stringify(steps, null, 2));

    const [wSteps] = await pool.execute('SELECT * FROM sales_order_workflow_steps WHERE sales_order_id = 11');
    console.log('Workflow Steps:', JSON.stringify(wSteps, null, 2));

  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
check();
