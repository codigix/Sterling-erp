const pool = require('../config/database');

const migration = {
  id: '042_update_production_plan_stages_status_enum',
  description: 'Update status ENUM in production_plan_stages to include outsourcing statuses',

  async up() {
    const conn = await pool.getConnection();
    try {
      console.log('Updating production_plan_stages status ENUM...');
      await conn.execute(`
        ALTER TABLE production_plan_stages 
        MODIFY COLUMN status ENUM('pending', 'in_progress', 'completed', 'on_hold', 'cancelled', 'outward_challan_generated', 'inward_challan_generated') DEFAULT 'pending'
      `);
      console.log('✅ Updated production_plan_stages status ENUM');
      await conn.release();
    } catch (error) {
      await conn.release();
      console.error('Migration failed:', error.message);
      throw error;
    }
  },

  async down() {
    const conn = await pool.getConnection();
    try {
      console.log('Rolling back production_plan_stages status ENUM...');
      await conn.execute(`
        ALTER TABLE production_plan_stages 
        MODIFY COLUMN status ENUM('pending', 'in_progress', 'completed', 'on_hold', 'cancelled') DEFAULT 'pending'
      `);
      console.log('✅ Rolled back production_plan_stages status ENUM');
      await conn.release();
    } catch (error) {
      await conn.release();
      throw error;
    }
  }
};

module.exports = migration;
