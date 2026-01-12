const pool = require('./config/database');

async function runMigration() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Adding sequential workflow fields to production_plan_stages...');
    
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'production_plan_stages' 
      AND TABLE_SCHEMA = DATABASE() 
      AND COLUMN_NAME IN ('blocked_by_stage_id', 'is_blocked')
    `);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    if (existingColumns.length === 2) {
      console.log('✓ Sequential workflow fields already exist');
      connection.release();
      await pool.end();
      process.exit(0);
      return;
    }
    
    if (!existingColumns.includes('blocked_by_stage_id')) {
      await connection.execute(`
        ALTER TABLE production_plan_stages 
        ADD COLUMN blocked_by_stage_id INT DEFAULT NULL
      `);
      console.log('✓ blocked_by_stage_id column added');
    }
    
    if (!existingColumns.includes('is_blocked')) {
      await connection.execute(`
        ALTER TABLE production_plan_stages 
        ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE
      `);
      console.log('✓ is_blocked column added');
    }
    
    try {
      await connection.execute(`
        ALTER TABLE production_plan_stages 
        ADD CONSTRAINT fk_blocked_by_stage 
        FOREIGN KEY (blocked_by_stage_id) REFERENCES production_plan_stages(id) ON DELETE SET NULL
      `);
      console.log('✓ Foreign key constraint added');
    } catch (fkError) {
      if (!fkError.message.includes('already exists')) {
        throw fkError;
      }
      console.log('✓ Foreign key constraint already exists');
    }
    
    try {
      await connection.execute(`
        CREATE INDEX idx_blocked_status ON production_plan_stages (is_blocked, production_plan_id)
      `);
      console.log('✓ Index created for blocked status queries');
    } catch (idxError) {
      if (!idxError.message.includes('already exists')) {
        throw idxError;
      }
      console.log('✓ Index already exists');
    }
    
    console.log('✓ Migration completed successfully!');
    connection.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    connection.release();
    await pool.end();
    process.exit(1);
  }
}

runMigration();
