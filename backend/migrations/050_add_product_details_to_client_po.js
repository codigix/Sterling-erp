const pool = require('../config/database');

const up = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('Adding product_details column to client_po_details table...');
    await connection.execute(`
      ALTER TABLE client_po_details 
      ADD COLUMN product_details JSON AFTER shipping_address
    `);
    console.log('✓ Added product_details column');
    connection.release();
  } catch (error) {
    connection.release();
    if (error.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Column product_details already exists, skipping...');
    } else {
      throw error;
    }
  }
};

const down = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('Removing product_details column from client_po_details table...');
    await connection.execute(`
      ALTER TABLE client_po_details 
      DROP COLUMN product_details
    `);
    console.log('✓ Removed product_details column');
    connection.release();
  } catch (error) {
    connection.release();
    throw error;
  }
};

module.exports = { up, down };
