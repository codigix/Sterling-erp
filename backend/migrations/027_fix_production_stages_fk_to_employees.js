const pool = require('../config/database');

module.exports = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('Fixing production_plan_stages foreign key to reference employees table...');
    
    await connection.execute(`
      ALTER TABLE production_plan_stages 
      DROP FOREIGN KEY production_plan_stages_ibfk_2
    `);
    
    console.log('✓ Old foreign key constraint removed');
    
    await connection.execute(`
      ALTER TABLE production_plan_stages 
      ADD CONSTRAINT production_plan_stages_ibfk_2 
      FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL
    `);
    
    console.log('✓ New foreign key constraint added - references employees(id)');
    
    connection.release();
    console.log('Migration completed successfully!');
  } catch (error) {
    connection.release();
    console.error('Migration failed:', error.message);
    throw error;
  }
};
