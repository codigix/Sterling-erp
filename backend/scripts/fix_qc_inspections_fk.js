const pool = require('../config/database');

async function migrate() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('Connected to database');

    console.log('Fixing qc_inspections foreign key constraint...');
    
    // First, drop the old foreign key constraint
    try {
      await conn.query('ALTER TABLE qc_inspections DROP FOREIGN KEY qc_inspections_ibfk_1');
      console.log('  ✓ Dropped old foreign key constraint');
    } catch (err) {
      if (err.message.includes('doesnt exist')) {
        console.log('  ℹ Old constraint already removed');
      } else {
        throw err;
      }
    }

    // Add the new foreign key constraint pointing to grn table
    try {
      await conn.query('ALTER TABLE qc_inspections ADD CONSTRAINT qc_inspections_ibfk_1 FOREIGN KEY (grn_id) REFERENCES grn(id) ON DELETE CASCADE');
      console.log('  ✓ Added new foreign key constraint (grn_id -> grn.id)');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('  ℹ New constraint already exists');
      } else {
        throw err;
      }
    }

    console.log('\nVerifying qc_inspections foreign keys...');
    const result = await conn.query('SHOW CREATE TABLE qc_inspections');
    const createTableSQL = result[0][0]['Create Table'];
    if (createTableSQL.includes('REFERENCES `grn`')) {
      console.log('  ✓ Foreign key now correctly references grn table');
    } else {
      console.log('  ✗ Foreign key still points to wrong table');
      console.log('\nFull CREATE TABLE statement:');
      console.log(createTableSQL);
    }

  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    if (conn) conn.release();
    process.exit();
  }
}

migrate();
