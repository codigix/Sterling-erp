const pool = require('../config/database');

const migration = {
  id: '023_create_project_inventory_tasks',
  description: 'Create project_inventory_tasks table for tracking inventory workflow steps per project',

  async up() {
    const conn = await pool.getConnection();
    try {
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS project_inventory_tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          project_id INT NOT NULL,
          root_card_id INT,
          step_number INT NOT NULL COMMENT '1-7 for the workflow steps',
          step_name VARCHAR(100) NOT NULL COMMENT 'Create RFQ, Send RFQ, Receive Quotes, Create PO, Approve PO, GRN Processing, Add to Stock',
          status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
          reference_id VARCHAR(100) COMMENT 'Reference to RFQ, PO, GRN number etc',
          reference_type VARCHAR(50) COMMENT 'Type: rfq, po, grn, quotation',
          completed_by INT COMMENT 'User ID who marked as completed',
          completed_at TIMESTAMP NULL,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          UNIQUE KEY unique_project_step (project_id, step_number),
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (root_card_id) REFERENCES root_cards(id) ON DELETE CASCADE,
          FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL,
          INDEX idx_project_id (project_id),
          INDEX idx_status (status),
          INDEX idx_step_number (step_number)
        )
      `);
      console.log('✅ Created project_inventory_tasks table');

      await conn.execute(`
        INSERT INTO project_inventory_tasks (project_id, root_card_id, step_number, step_name, status)
        SELECT DISTINCT 
          p.id,
          rc.id,
          1,
          'Create RFQ',
          'pending'
        FROM projects p
        LEFT JOIN root_cards rc ON rc.project_id = p.id
        WHERE NOT EXISTS (
          SELECT 1 FROM project_inventory_tasks pit 
          WHERE pit.project_id = p.id AND pit.step_number = 1
        )
      `);
      console.log('✅ Initialized project_inventory_tasks for existing projects');
    } finally {
      await conn.release();
    }
  },

  async down() {
    const conn = await pool.getConnection();
    try {
      await conn.execute('DROP TABLE IF EXISTS project_inventory_tasks');
      console.log('✅ Dropped project_inventory_tasks table');
    } finally {
      await conn.release();
    }
  }
};

module.exports = migration;
