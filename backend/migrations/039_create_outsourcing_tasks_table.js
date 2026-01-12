const pool = require('../config/database');

const migration = {
  id: '039_create_outsourcing_tasks_table',
  description: 'Create outsourcing_tasks table for managing outsource production phases',

  async up() {
    const conn = await pool.getConnection();
    try {
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS outsourcing_tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          production_plan_stage_id INT NOT NULL,
          production_plan_id INT NOT NULL,
          project_id INT,
          root_card_id INT,
          product_name VARCHAR(255),
          status ENUM('pending', 'outward_challan_generated', 'inward_challan_generated', 'completed', 'cancelled') DEFAULT 'pending',
          selected_vendor_id INT,
          assigned_department VARCHAR(100) DEFAULT 'Production',
          created_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          FOREIGN KEY (production_plan_stage_id) REFERENCES production_plan_stages(id) ON DELETE CASCADE,
          FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE CASCADE,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
          FOREIGN KEY (root_card_id) REFERENCES root_cards(id) ON DELETE SET NULL,
          FOREIGN KEY (selected_vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
          
          INDEX idx_production_plan_stage (production_plan_stage_id),
          INDEX idx_production_plan (production_plan_id),
          INDEX idx_status (status),
          INDEX idx_vendor (selected_vendor_id)
        )
      `);
      console.log('✅ Created outsourcing_tasks table');
      await conn.release();
    } catch (error) {
      await conn.release();
      throw error;
    }
  },

  async down() {
    const conn = await pool.getConnection();
    try {
      await conn.execute('DROP TABLE IF EXISTS outsourcing_tasks');
      console.log('✅ Dropped outsourcing_tasks table');
      await conn.release();
    } catch (error) {
      await conn.release();
      throw error;
    }
  }
};

module.exports = migration;
