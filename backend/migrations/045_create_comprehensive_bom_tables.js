const pool = require('../config/database');

async function createComprehensiveBOMTables() {
  let connection = null;
  try {
    connection = await pool.getConnection();

    console.log('Creating BOM component tables...');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bom_components (
        id INT PRIMARY KEY AUTO_INCREMENT,
        bom_id INT NOT NULL,
        component_code VARCHAR(255),
        quantity DECIMAL(12, 4) NOT NULL,
        uom VARCHAR(50),
        rate DECIMAL(12, 2) DEFAULT 0,
        loss_percent DECIMAL(5, 2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (bom_id) REFERENCES bill_of_materials(id) ON DELETE CASCADE,
        INDEX idx_bom_id (bom_id)
      )
    `);
    console.log('✅ bom_components table created/verified');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bom_materials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        bom_id INT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        quantity DECIMAL(12, 4) NOT NULL,
        uom VARCHAR(50),
        item_group VARCHAR(100),
        rate DECIMAL(12, 2) DEFAULT 0,
        warehouse VARCHAR(255),
        operation VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (bom_id) REFERENCES bill_of_materials(id) ON DELETE CASCADE,
        INDEX idx_bom_id (bom_id)
      )
    `);
    console.log('✅ bom_materials table created/verified');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bom_operations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        bom_id INT NOT NULL,
        operation_name VARCHAR(255) NOT NULL,
        workstation VARCHAR(255),
        cycle_time DECIMAL(10, 2) DEFAULT 0,
        setup_time DECIMAL(10, 2) DEFAULT 0,
        hourly_rate DECIMAL(12, 2) DEFAULT 0,
        cost DECIMAL(12, 2) DEFAULT 0,
        type ENUM('in-house', 'outsource') DEFAULT 'in-house',
        target_warehouse VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (bom_id) REFERENCES bill_of_materials(id) ON DELETE CASCADE,
        INDEX idx_bom_id (bom_id)
      )
    `);
    console.log('✅ bom_operations table created/verified');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bom_scrap_loss (
        id INT PRIMARY KEY AUTO_INCREMENT,
        bom_id INT NOT NULL,
        item_code VARCHAR(255),
        name VARCHAR(255),
        input_qty DECIMAL(12, 4),
        loss_percent DECIMAL(5, 2) DEFAULT 0,
        rate DECIMAL(12, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (bom_id) REFERENCES bill_of_materials(id) ON DELETE CASCADE,
        INDEX idx_bom_id (bom_id)
      )
    `);
    console.log('✅ bom_scrap_loss table created/verified');

    const alterQueries = [
      'ALTER TABLE bill_of_materials ADD COLUMN IF NOT EXISTS product_name VARCHAR(255)',
      'ALTER TABLE bill_of_materials ADD COLUMN IF NOT EXISTS item_code VARCHAR(255)',
      'ALTER TABLE bill_of_materials ADD COLUMN IF NOT EXISTS item_group VARCHAR(100)',
      'ALTER TABLE bill_of_materials ADD COLUMN IF NOT EXISTS quantity DECIMAL(12, 4)',
      'ALTER TABLE bill_of_materials ADD COLUMN IF NOT EXISTS uom VARCHAR(50)',
      'ALTER TABLE bill_of_materials ADD COLUMN IF NOT EXISTS revision INT DEFAULT 1',
      'ALTER TABLE bill_of_materials ADD COLUMN IF NOT EXISTS is_active TINYINT DEFAULT 1',
      'ALTER TABLE bill_of_materials ADD COLUMN IF NOT EXISTS is_default TINYINT DEFAULT 0'
    ];
    
    for (const query of alterQueries) {
      try {
        await connection.execute(query);
      } catch (err) {
        if (!err.message.includes('Duplicate column name')) {
          throw err;
        }
      }
    }
    console.log('✅ bill_of_materials table updated');

    console.log('✅ All comprehensive BOM tables created successfully!');
  } catch (error) {
    console.error('Error creating comprehensive BOM tables:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = { createComprehensiveBOMTables };
