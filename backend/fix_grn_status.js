const pool = require('./config/database');

async function fixGrnQcStatus() {
  try {
    console.log('Fixing qc_status ENUM definition in grn table...');
    
    // Modify the qc_status column to accept 'approved' and 'completed' as well
    // Current definition: qc_status ENUM('pending', 'passed', 'failed')
    // New definition: qc_status ENUM('pending', 'passed', 'failed', 'approved', 'completed')
    
    await pool.execute(`
      ALTER TABLE grn 
      MODIFY COLUMN qc_status ENUM('pending', 'passed', 'failed', 'approved', 'completed') DEFAULT 'pending'
    `);
    
    console.log('Successfully updated grn table schema!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

fixGrnQcStatus();
