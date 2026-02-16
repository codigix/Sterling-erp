const pool = require('../config/database');

const up = async () => {
  try {
    // Check if column exists first
    const [columns] = await pool.execute('SHOW COLUMNS FROM grn LIKE "vendor_id"');
    if (columns.length === 0) {
      await pool.execute(`
        ALTER TABLE grn 
        ADD COLUMN vendor_id INT NULL AFTER po_id,
        ADD FOREIGN KEY (vendor_id) REFERENCES vendors(id)
      `);
      console.log('GRN table updated with vendor_id');
    } else {
      console.log('vendor_id column already exists in grn table');
    }
  } catch (error) {
    console.error('Error updating grn table:', error);
    throw error;
  }
};

const down = async () => {
  await pool.execute(`
    ALTER TABLE grn 
    DROP COLUMN vendor_id
  `);
  console.log('GRN table vendor_id column dropped');
};

module.exports = { up, down };
