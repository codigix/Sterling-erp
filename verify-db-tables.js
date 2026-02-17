const pool = require('./backend/config/database');

async function verify() {
  try {
    const rootCardId = 11;
    
    const [so] = await pool.execute('SELECT id, po_number FROM sales_orders WHERE id = ?', [rootCardId]);
    console.log('Root Card (sales_orders):', so.length ? JSON.stringify(so[0]) : 'NOT FOUND');

    const [legacySteps] = await pool.execute('SELECT step_id, status FROM sales_order_steps WHERE sales_order_id = ?', [rootCardId]);
    console.log('Legacy steps:', legacySteps.length, legacySteps.map(s => `${s.step_id}:${s.status}`).join(', '));

    const [workflowSteps] = await pool.execute('SELECT step_number, status FROM sales_order_workflow_steps WHERE sales_order_id = ?', [rootCardId]);
    console.log('Workflow steps:', workflowSteps.length, workflowSteps.map(s => `${s.step_number}:${s.status}`).join(', '));

    const [design] = await pool.execute('SELECT id FROM design_engineering_details WHERE sales_order_id = ?', [rootCardId]);
    console.log('Design details:', design.length);

    const [materials] = await pool.execute('SELECT id FROM material_requirements_details WHERE sales_order_id = ?', [rootCardId]);
    console.log('Material details:', materials.length);

    const [production] = await pool.execute('SELECT id FROM production_plan_details WHERE sales_order_id = ? OR root_card_id = ?', [rootCardId, rootCardId]);
    console.log('Production plan details:', production.length);

    process.exit(0);
  } catch (err) {
    console.error('Verification failed:', err);
    process.exit(1);
  }
}

verify();
