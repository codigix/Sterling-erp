const pool = require('../config/database');

const migration = {
  id: '040_create_outward_challan_table',
  description: 'Create outward_challan and outward_challan_items tables for outsourcing workflow',

  async up() {
    const conn = await pool.getConnection();
    try {
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS outward_challans (
          id INT AUTO_INCREMENT PRIMARY KEY,
          outsourcing_task_id INT NOT NULL,
          challan_number VARCHAR(100) UNIQUE NOT NULL,
          vendor_id INT NOT NULL,
          status ENUM('draft', 'issued', 'received', 'cancelled') DEFAULT 'draft',
          material_sent_date DATE,
          expected_return_date DATE,
          notes TEXT,
          created_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          FOREIGN KEY (outsourcing_task_id) REFERENCES outsourcing_tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
          
          UNIQUE KEY unique_challan (challan_number),
          INDEX idx_outsourcing_task (outsourcing_task_id),
          INDEX idx_vendor (vendor_id),
          INDEX idx_status (status),
          INDEX idx_created_date (created_at)
        )
      `);
      console.log('✅ Created outward_challans table');

      await conn.execute(`
        CREATE TABLE IF NOT EXISTS outward_challan_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          outward_challan_id INT NOT NULL,
          material_id INT NOT NULL,
          quantity DECIMAL(10, 2) NOT NULL,
          unit VARCHAR(50),
          remarks TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          FOREIGN KEY (outward_challan_id) REFERENCES outward_challans(id) ON DELETE CASCADE,
          FOREIGN KEY (material_id) REFERENCES inventory(id) ON DELETE RESTRICT,
          
          INDEX idx_challan (outward_challan_id),
          INDEX idx_material (material_id)
        )
      `);
      console.log('✅ Created outward_challan_items table');
      await conn.release();
    } catch (error) {
      await conn.release();
      throw error;
    }
  },

  async down() {
    const conn = await pool.getConnection();
    try {
      await conn.execute('DROP TABLE IF EXISTS outward_challan_items');
      await conn.execute('DROP TABLE IF EXISTS outward_challans');
      console.log('✅ Dropped outward_challan tables');
      await conn.release();
    } catch (error) {
      await conn.release();
      throw error;
    }
  }
};

module.exports = migration;
