const db = require('../config/database');

async function up() {
  const conn = await db.getConnection();
  try {
    // Modify the status column to include 'conditional'
    await conn.query(`
      ALTER TABLE qc_inspections 
      MODIFY COLUMN status ENUM('pending', 'in_progress', 'passed', 'failed', 'partial', 'conditional') DEFAULT 'pending'
    `);
    console.log('Updated qc_inspections status enum to include conditional');
  } catch (error) {
    console.error('Error updating qc_inspections status:', error);
  } finally {
    conn.release();
  }
}

module.exports = { up };
