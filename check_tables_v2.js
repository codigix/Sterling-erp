const pool = require('./backend/config/database');
(async () => {
  try {
    const [rows] = await pool.execute('SHOW TABLES LIKE "inventory_workflow_steps"');
    console.log(`inventory_workflow_steps table exists: ${rows.length > 0}`);
    
    const [rows2] = await pool.execute('SHOW TABLES LIKE "production_workflow_steps"');
    console.log(`production_workflow_steps table exists: ${rows2.length > 0}`);
    
    const [rows3] = await pool.execute('SHOW TABLES LIKE "design_workflow_steps"');
    console.log(`design_workflow_steps table exists: ${rows3.length > 0}`);
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();