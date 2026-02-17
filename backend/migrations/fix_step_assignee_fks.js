const pool = require('../config/database');

async function migrate() {
  try {
    console.log('🔄 Migrating assigned person foreign keys to reference employees(id)...');
    
    // 1. sales_order_steps
    console.log('--- Migrating sales_order_steps ---');
    try {
      await pool.execute('ALTER TABLE sales_order_steps DROP FOREIGN KEY sales_order_steps_ibfk_2');
      console.log('✅ Dropped FK sales_order_steps_ibfk_2');
    } catch (e) {
      console.log('⚠️ Could not drop sales_order_steps_ibfk_2, it might not exist or have a different name.');
    }
    
    await pool.execute('ALTER TABLE sales_order_steps MODIFY COLUMN assigned_to INT');
    await pool.execute('ALTER TABLE sales_order_steps ADD CONSTRAINT fk_so_steps_employee FOREIGN KEY (assigned_to) REFERENCES employees(id)');
    console.log('✅ Created new FK for sales_order_steps to employees(id)');

    // 2. sales_order_workflow_steps
    console.log('--- Migrating sales_order_workflow_steps ---');
    try {
      await pool.execute('ALTER TABLE sales_order_workflow_steps DROP FOREIGN KEY sales_order_workflow_steps_ibfk_2');
      console.log('✅ Dropped FK sales_order_workflow_steps_ibfk_2');
    } catch (e) {
      console.log('⚠️ Could not drop sales_order_workflow_steps_ibfk_2, it might not exist or have a different name.');
    }

    await pool.execute('ALTER TABLE sales_order_workflow_steps MODIFY COLUMN assigned_employee_id INT');
    await pool.execute('ALTER TABLE sales_order_workflow_steps ADD CONSTRAINT fk_so_workflow_steps_employee FOREIGN KEY (assigned_employee_id) REFERENCES employees(id)');
    console.log('✅ Created new FK for sales_order_workflow_steps to employees(id)');

    console.log('✨ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
