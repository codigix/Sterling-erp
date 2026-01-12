const pool = require('../config/database');

const migration = {
  id: '041_create_inward_challan_table',
  description: 'Create inward_challan and inward_challan_items tables for material receipt workflow',

  async up() {
    const conn = await pool.getConnection();
    try {
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS inward_challans (
          id INT AUTO_INCREMENT PRIMARY KEY,
          outward_challan_id INT NOT NULL,
          challan_number VARCHAR(100) UNIQUE NOT NULL,
          status ENUM('draft', 'received', 'inspected', 'rejected') DEFAULT 'draft',
          received_date DATE,
          received_by INT,
          inspection_notes TEXT,
          quality_status VARCHAR(50),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          FOREIGN KEY (outward_challan_id) REFERENCES outward_challans(id) ON DELETE CASCADE,
          FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL,
          
          UNIQUE KEY unique_inward_challan (challan_number),
          INDEX idx_outward_challan (outward_challan_id),
          INDEX idx_status (status),
          INDEX idx_received_date (received_date)
        )
      `);
      console.log('✅ Created inward_challans table');

      await conn.execute(`
        CREATE TABLE IF NOT EXISTS inward_challan_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          inward_challan_id INT NOT NULL,
          outward_challan_item_id INT,
          material_id INT NOT NULL,
          quantity_received DECIMAL(10, 2) NOT NULL,
          quantity_expected DECIMAL(10, 2),
          unit VARCHAR(50),
          quality_status ENUM('accepted', 'rejected', 'pending_inspection') DEFAULT 'pending_inspection',
          remarks TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          FOREIGN KEY (inward_challan_id) REFERENCES inward_challans(id) ON DELETE CASCADE,
          FOREIGN KEY (outward_challan_item_id) REFERENCES outward_challan_items(id) ON DELETE SET NULL,
          FOREIGN KEY (material_id) REFERENCES inventory(id) ON DELETE RESTRICT,
          
          INDEX idx_challan (inward_challan_id),
          INDEX idx_material (material_id),
          INDEX idx_quality_status (quality_status)
        )
      `);
      console.log('✅ Created inward_challan_items table');
      await conn.release();
    } catch (error) {
      await conn.release();
      throw error;
    }
  },

  async down() {
    const conn = await pool.getConnection();
    try {
      await conn.execute('DROP TABLE IF EXISTS inward_challan_items');
      await conn.execute('DROP TABLE IF EXISTS inward_challans');
      console.log('✅ Dropped inward_challan tables');
      await conn.release();
    } catch (error) {
      await conn.release();
      throw error;
    }
  }
};

module.exports = migration;
