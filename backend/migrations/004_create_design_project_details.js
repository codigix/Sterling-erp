const pool = require('../config/database');

async function createDesignProjectDetailsTable() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Creating design_project_details table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS design_project_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        root_card_id INT NOT NULL UNIQUE,
        design_id VARCHAR(255),
        project_name VARCHAR(255),
        product_name VARCHAR(255),
        design_status VARCHAR(50) DEFAULT 'draft',
        design_engineer_name VARCHAR(255),
        system_length DECIMAL(10, 2),
        system_width DECIMAL(10, 2),
        system_height DECIMAL(10, 2),
        load_capacity DECIMAL(12, 2),
        operating_environment TEXT,
        material_grade VARCHAR(255),
        surface_finish VARCHAR(255),
        steel_sections JSON,
        plates JSON,
        fasteners JSON,
        components JSON,
        electrical JSON,
        consumables JSON,
        design_specifications TEXT,
        manufacturing_instructions TEXT,
        quality_safety TEXT,
        additional_notes TEXT,
        reference_documents JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (root_card_id) REFERENCES root_cards(id) ON DELETE CASCADE,
        INDEX idx_root_card (root_card_id),
        INDEX idx_design_status (design_status)
      )
    `);
    
    console.log('✅ design_project_details table created successfully');
    
  } catch (error) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('⚠️  design_project_details table already exists');
    } else {
      console.error('❌ Error creating design_project_details table:', error.message);
      throw error;
    }
  } finally {
    connection.release();
  }
}

createDesignProjectDetailsTable()
  .then(() => {
    console.log('✅ Migration completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
