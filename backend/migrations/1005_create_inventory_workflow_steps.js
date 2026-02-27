const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('Creating inventory_workflow_steps table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS inventory_workflow_steps (
        id INT PRIMARY KEY AUTO_INCREMENT,
        step_name VARCHAR(255) NOT NULL,
        step_order INT NOT NULL,
        description TEXT,
        task_template_title VARCHAR(255) NOT NULL,
        task_template_description TEXT,
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        auto_create_on_trigger VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_inventory_step_order (step_order)
      )
    `);

    console.log('Inserting default inventory workflow steps...');
    const steps = [
      ['RFQ Creation', 1, 'Initiate Request for Quotation for materials requested by production', 'Create RFQ', 'Create RFQs for all items in the material request that are not in stock', 'high', 'material_request_received'],
      ['RFQ Dispatch', 2, 'Send RFQs to identified vendors and follow up', 'Send RFQ to Vendor', 'Dispatch RFQs to selected vendors and ensure receipt', 'high', 'rfq_created'],
      ['Quotation Processing', 3, 'Collect and evaluate quotes from vendors', 'Receive & Record Quotes', 'Record incoming quotes and perform technical/commercial evaluation', 'high', 'rfq_sent'],
      ['Purchase Order Creation', 4, 'Generate Purchase Orders for selected vendors', 'Create PO', 'Generate official POs based on approved quotations', 'high', 'quotes_received'],
      ['PO Approval', 5, 'Obtain necessary internal approvals for the PO', 'Approve PO', 'Review PO details and approve for vendor dispatch', 'high', 'po_created'],
      ['GRN & Quality Check', 6, 'Receive materials and perform quality inspections', 'GRN Processing & QC', 'Process Goods Receipt Note and coordinate with QC for material inspection', 'high', 'po_approved'],
      ['Inventory Storage', 7, 'Add inspected materials to warehouse stock', 'Add to Stock', 'Update inventory levels and move materials to assigned warehouse locations', 'medium', 'qc_passed']
    ];

    for (const step of steps) {
      await connection.execute(
        'INSERT INTO inventory_workflow_steps (step_name, step_order, description, task_template_title, task_template_description, priority, auto_create_on_trigger) VALUES (?, ?, ?, ?, ?, ?, ?)',
        step
      );
    }

    await connection.commit();
    console.log('Migration completed successfully!');
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
