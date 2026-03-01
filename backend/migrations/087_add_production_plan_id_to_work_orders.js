const pool = require('../config/database');

async function migrate() {
  try {
    console.log('Running migration: 087_add_production_plan_id_to_work_orders...');
    
    // Check if column exists first
    const [rows] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.columns 
      WHERE table_name = 'work_orders' AND column_name = 'production_plan_id'
    `);
    
    if (rows[0].count === 0) {
      await pool.query(`
        ALTER TABLE work_orders 
        ADD COLUMN production_plan_id VARCHAR(100) NULL AFTER root_card_id,
        ADD INDEX idx_wo_plan_id (production_plan_id)
      `);
      console.log('✅ Added production_plan_id column to work_orders.');
    } else {
      console.log('ℹ️ Column production_plan_id already exists.');
    }
    
    console.log('✅ Migration 087 completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration 087 failed:', err.message);
    process.exit(1);
  }
}

migrate();
