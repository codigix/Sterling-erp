const db = require('../config/database');

async function up() {
  const conn = await db.getConnection();
  try {
    const [columns] = await conn.query("SHOW COLUMNS FROM qc_inspections LIKE 'items_results'");
    if (columns.length === 0) {
      await conn.query("ALTER TABLE qc_inspections ADD COLUMN items_results JSON AFTER inspection_type");
      console.log('Added items_results column to qc_inspections');
    } else {
      console.log('items_results column already exists');
    }
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    conn.release();
  }
}

module.exports = { up };
