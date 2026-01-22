const pool = require('./backend/config/database');
require('dotenv').config();

async function checkDesignContent() {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM design_engineering_details WHERE sales_order_id = ?',
      [9]
    );
    console.log(JSON.stringify(rows[0], null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkDesignContent();
