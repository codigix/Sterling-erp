const pool = require('../config/database');

const up = async () => {
  await pool.execute(`
    ALTER TABLE grn 
    ADD COLUMN receipt_date DATE,
    ADD COLUMN transporter_notes TEXT
  `);
  console.log('GRN table updated with receipt_date and transporter_notes');
};

const down = async () => {
  await pool.execute(`
    ALTER TABLE grn 
    DROP COLUMN receipt_date,
    DROP COLUMN transporter_notes
  `);
  console.log('GRN table columns dropped');
};

module.exports = { up, down };
