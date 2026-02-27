const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('Truncating inventory_workflow_steps to re-insert refined steps...');
    await connection.execute('DELETE FROM inventory_workflow_steps');

    console.log('Inserting refined inventory workflow steps...');
    const steps = [
      ['Stock Verification', 1, 'Audit current stock levels and decide on immediate Release or Procurement Initiation', 'Stock Verification & Strategy', 'Check if materials are in stock for MR. If yes, Release directly. If no, click "Create PO" to start the RFQ process.', 'high', 'material_request_received'],
      ['RFQ Management', 2, 'Create and dispatch Request for Quotations to vendors for bidding', 'Create & Send RFQ', 'Initiate the procurement cycle by generating RFQs and sending them to identified vendors.', 'high', 'po_clicked'],
      ['Quote Evaluation', 3, 'Receive, record, and approve vendor quotations from communications', 'Record & Approve Vendor Quotation', 'Check vendor replies in communications, record incoming quotations, and perform final selection/approval.', 'high', 'rfq_sent'],
      ['PO Lifecycle', 4, 'Generate Purchase Order from approved quotation and send to vendor', 'Create & Send Purchase Order', 'Generate official PO from the approved quotation and dispatch it to the selected vendor.', 'high', 'quotation_approved'],
      ['Material Receipt & GRN', 5, 'Record material arrival and generate Purchase Receipt/GRN', 'Process Material Receipt & GRN', 'Acknowledge physical delivery of items and create the Goods Receipt Note (GRN) request.', 'high', 'po_sent'],
      ['Quality Inspection', 6, 'Verify material quality and compliance standards', 'Perform Quality Control Inspection', 'Conduct technical inspection of received items to ensure they meet specifications.', 'high', 'grn_processed'],
      ['Fulfillment & Release', 7, 'Add approved materials to stock and release to Production', 'Add to Stock & Release Material', 'Add inspected materials to warehouse stock and finalize the release to the Production department.', 'medium', 'qc_passed']
    ];

    for (const step of steps) {
      await connection.execute(
        'INSERT INTO inventory_workflow_steps (step_name, step_order, description, task_template_title, task_template_description, priority, auto_create_on_trigger) VALUES (?, ?, ?, ?, ?, ?, ?)',
        step
      );
    }

    await connection.commit();
    console.log('Refined Migration completed successfully!');
  } catch (error) {
    await connection.rollback();
    console.error('Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

migrate().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
