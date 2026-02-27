const pool = require('../config/database');

async function createProductionPhaseMasterTable() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS production_phase_master (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed initial phases from Step4_ProductionPlan.jsx
    const initialPhases = [
      'Material Prep',
      'Fabrication',
      'Machining',
      'Surface Prep',
      'Assembly',
      'Electrical'
    ];

    for (const phase of initialPhases) {
      await connection.execute(
        'INSERT IGNORE INTO production_phase_master (name, is_default) VALUES (?, ?)',
        [phase, true]
      );
    }

    await connection.query('COMMIT');
    console.log('✅ Production Phase Master table created and seeded successfully');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error creating production_phase_master table:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

createProductionPhaseMasterTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
