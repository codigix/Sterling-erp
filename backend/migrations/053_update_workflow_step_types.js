const pool = require('../config/database');

const up = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('Updating sales_order_workflow_steps.step_type ENUM...');

    // 1. Map old values to new values before changing ENUM to avoid data loss
    await connection.execute(`UPDATE sales_order_workflow_steps SET step_type = 'material_requirement' WHERE step_type = 'material_request'`);
    await connection.execute(`UPDATE sales_order_workflow_steps SET step_type = 'delivery' WHERE step_type = 'delivered'`);
    await connection.execute(`UPDATE sales_order_workflow_steps SET step_type = 'design_engineering' WHERE step_type = 'designs_upload'`);

    // 2. Modify the column with the new ENUM
    await connection.execute(`
      ALTER TABLE sales_order_workflow_steps 
      MODIFY COLUMN step_type ENUM('po_details', 'design_engineering', 'material_requirement', 'production_plan', 'quality_check', 'shipment', 'delivery') NOT NULL
    `);

    await connection.commit();
    console.log('✅ Workflow step types updated successfully');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
};

const down = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    await connection.execute(`
      ALTER TABLE sales_order_workflow_steps 
      MODIFY COLUMN step_type ENUM('po_details', 'sales_details', 'documents_upload', 'designs_upload', 'material_request', 'production_plan', 'quality_check', 'shipment', 'delivered') NOT NULL
    `);
    
    await connection.execute(`UPDATE sales_order_workflow_steps SET step_type = 'material_request' WHERE step_type = 'material_requirement'`);
    await connection.execute(`UPDATE sales_order_workflow_steps SET step_type = 'delivered' WHERE step_type = 'delivery'`);
    await connection.execute(`UPDATE sales_order_workflow_steps SET step_type = 'designs_upload' WHERE step_type = 'design_engineering'`);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { up, down };
