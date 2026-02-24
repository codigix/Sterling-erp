const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('Creating production_workflow_steps table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS production_workflow_steps (
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
        UNIQUE KEY unique_production_step_order (step_order)
      )
    `);

    console.log('Inserting default production workflow steps...');
    const steps = [
      ['Production Planning', 1, 'Define manufacturing phases and resource allocation', 'Create Production Plan', 'Develop a comprehensive manufacturing plan including timeline and resource assignments', 'high', 'root_card_approved'],
      ['Material Procurement', 2, 'Ensure all required raw materials and components are available', 'Initiate Material Request', 'Verify BOM requirements against inventory and raise material requests for shortages', 'high', 'plan_created'],
      ['Work Order Generation', 3, 'Create detailed work orders for manufacturing operations', 'Generate Work Orders', 'Break down the production plan into actionable work orders for specific workstations', 'high', 'materials_ready'],
      ['Manufacturing Execution', 4, 'Execute the manufacturing process according to work orders', 'Execute Job Cards', 'Process job cards and track real-time production progress at each workstation', 'medium', 'work_orders_issued'],
      ['Quality Control', 5, 'Perform rigorous quality checks on finished parts and assemblies', 'Perform Quality Checks', 'Conduct final inspections and verify compliance with technical specifications', 'high', 'manufacturing_completed'],
      ['Packaging & Shipment', 6, 'Prepare finished goods for delivery and initiate shipment', 'Initiate Shipment', 'Pack goods according to standards and generate necessary outward challans for delivery', 'medium', 'qc_passed'],
      ['Delivery Completion', 7, 'Ensure successful delivery to client and project closure', 'Confirm Delivery', 'Track shipment status and confirm final receipt by the customer to close the project', 'low', 'shipped']
    ];

    for (const step of steps) {
      await connection.execute(
        'INSERT INTO production_workflow_steps (step_name, step_order, description, task_template_title, task_template_description, priority, auto_create_on_trigger) VALUES (?, ?, ?, ?, ?, ?, ?)',
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
