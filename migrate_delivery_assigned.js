const pool = require('./backend/config/database');
async function migrate() {
  try {
    console.log('Adding assigned_to column to delivery_details...');
    await pool.execute(`
      ALTER TABLE delivery_details 
      ADD COLUMN assigned_to INT AFTER production_supervisor,
      ADD CONSTRAINT fk_delivery_assigned_to FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL,
      ADD INDEX idx_delivery_assigned_to (assigned_to)
    `);
    console.log('Successfully added assigned_to column.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  }
  process.exit(0);
}
migrate();
