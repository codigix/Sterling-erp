const pool = require('./backend/config/database');
async function fix() {
  try {
    const columns = [
      'ALTER TABLE quality_check_details ADD COLUMN payment_terms VARCHAR(255)',
      'ALTER TABLE quality_check_details ADD COLUMN special_instructions TEXT',
      'ALTER TABLE quality_check_details ADD COLUMN estimated_costing DECIMAL(12,2)',
      'ALTER TABLE quality_check_details ADD COLUMN estimated_profit DECIMAL(12,2)',
      'ALTER TABLE quality_check_details ADD COLUMN job_card_no VARCHAR(100)'
    ];
    for (const sql of columns) {
      try {
        await pool.execute(sql);
        console.log(`Executed: ${sql}`);
      } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
          console.log(`Column already exists: ${sql.split(' ').pop()}`);
        } else {
          throw err;
        }
      }
    }
    console.log('QC Table update complete');
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
fix();
