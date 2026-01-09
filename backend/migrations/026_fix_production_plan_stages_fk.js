const pool = require('../config/database');

module.exports = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('Dropping foreign key constraint on assigned_employee_id...');
    
    await connection.execute(`
      ALTER TABLE production_plan_stages 
      DROP FOREIGN KEY production_plan_stages_ibfk_2
    `);
    
    console.log('✓ Foreign key constraint removed');
    
    // Optionally, add it back WITH ON DELETE SET NULL for safety
    console.log('Adding back foreign key with ON DELETE SET NULL...');
    
    await connection.execute(`
      ALTER TABLE production_plan_stages 
      ADD CONSTRAINT production_plan_stages_ibfk_2 
      FOREIGN KEY (assigned_employee_id) REFERENCES users(id) ON DELETE SET NULL
    `);
    
    console.log('✓ Foreign key constraint re-added with ON DELETE SET NULL');
    
    connection.release();
    console.log('Migration completed successfully!');
  } catch (error) {
    connection.release();
    console.error('Migration failed:', error.message);
    throw error;
  }
};
