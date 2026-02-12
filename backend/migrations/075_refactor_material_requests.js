const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    console.log('Refactoring material_requests table...');

    // 1. Add new columns to material_requests
    await connection.execute(`
      ALTER TABLE material_requests 
      ADD COLUMN mr_number VARCHAR(100) UNIQUE AFTER id,
      ADD COLUMN department VARCHAR(100) DEFAULT 'Production' AFTER production_plan_id,
      ADD COLUMN purpose VARCHAR(100) DEFAULT 'Material Issue' AFTER department,
      ADD COLUMN target_warehouse_id INT AFTER purpose,
      ADD COLUMN requested_by INT AFTER created_by,
      ADD CONSTRAINT fk_mr_warehouse FOREIGN KEY (target_warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL,
      ADD CONSTRAINT fk_mr_requested_by FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL
    `);

    // 2. Create material_request_items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS material_request_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        material_request_id INT NOT NULL,
        material_name VARCHAR(255) NOT NULL,
        material_code VARCHAR(100),
        quantity DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(50) DEFAULT 'Nos',
        specification TEXT,
        status ENUM('pending', 'ordered', 'received', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (material_request_id) REFERENCES material_requests(id) ON DELETE CASCADE,
        INDEX idx_mr_id (material_request_id)
      )
    `);

    // 3. Migrate existing data
    // For each row in material_requests, create a corresponding row in material_request_items
    const [existingRequests] = await connection.execute('SELECT * FROM material_requests');
    
    for (const req of existingRequests) {
      // Generate an mr_number if it doesn't exist
      const date = new Date(req.created_at);
      const dateStr = date.toISOString().slice(0,10).replace(/-/g, '');
      const mrNumber = `MR-${dateStr}-${req.id}`;
      
      await connection.execute(
        'UPDATE material_requests SET mr_number = ?, requested_by = ? WHERE id = ?',
        [mrNumber, req.created_by, req.id]
      );

      await connection.execute(
        `INSERT INTO material_request_items 
         (material_request_id, material_name, material_code, quantity, unit, specification, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.id,
          req.material_name,
          req.material_code,
          req.quantity,
          req.unit,
          req.specification,
          req.status === 'ordered' ? 'ordered' : (req.status === 'received' ? 'received' : 'pending')
        ]
      );
    }

    // 4. Remove item-specific columns from material_requests
    // We'll do this in a separate step or just leave them for now to avoid breaking things too fast.
    // Actually, it's better to remove them to enforce the new structure.
    await connection.execute(`
      ALTER TABLE material_requests 
      DROP COLUMN material_name,
      DROP COLUMN material_code,
      DROP COLUMN quantity,
      DROP COLUMN unit,
      DROP COLUMN specification
    `);

    await connection.query('COMMIT');
    console.log('✅ Material Requests refactored successfully');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error refactoring tables:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
