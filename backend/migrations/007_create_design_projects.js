const pool = require('../config/database');

async function createDesignProjectsTable() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Creating design_projects table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS design_projects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        project_name VARCHAR(255) NOT NULL,
        project_code VARCHAR(100),
        design_id VARCHAR(255),
        product_name VARCHAR(255),
        client_name VARCHAR(255),
        priority VARCHAR(50) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'draft',
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
        INDEX idx_project_code (project_code),
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_created_at (created_at)
      )
    `);
    
    console.log('✅ design_projects table created successfully');
    
  } catch (error) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('⚠️  design_projects table already exists');
    } else {
      console.error('❌ Error creating design_projects table:', error.message);
      throw error;
    }
  } finally {
    connection.release();
  }
}

createDesignProjectsTable()
  .then(() => {
    console.log('✅ Migration completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
