const pool = require('../config/database');

async function migrate() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('Connected to database');

    console.log('Checking qc_reports foreign key constraint...');
    
    // Get constraint name
    const [rows] = await conn.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'sterling_erp' 
      AND TABLE_NAME = 'qc_reports' 
      AND REFERENCED_TABLE_NAME = 'grn'
    `);

    if (rows.length === 0) {
      console.log('  ! No foreign key found pointing to grn. Creating one...');
    } else {
      const constraintName = rows[0].CONSTRAINT_NAME;
      console.log(`  Found constraint: ${constraintName}`);

      // Check if it has ON DELETE CASCADE
      // We can check REFERENTIAL_CONSTRAINTS table
      const [rcRows] = await conn.query(`
        SELECT DELETE_RULE 
        FROM information_schema.REFERENTIAL_CONSTRAINTS 
        WHERE CONSTRAINT_SCHEMA = 'sterling_erp' 
        AND CONSTRAINT_NAME = ? 
        AND TABLE_NAME = 'qc_reports'
      `, [constraintName]);

      if (rcRows.length > 0 && rcRows[0].DELETE_RULE === 'CASCADE') {
        console.log('  ✓ Constraint already has ON DELETE CASCADE. No action needed.');
        return;
      }

      console.log(`  ! Constraint does not have ON DELETE CASCADE (Rule: ${rcRows[0]?.DELETE_RULE}). Fixing...`);
      
      // Drop old constraint
      await conn.query(`ALTER TABLE qc_reports DROP FOREIGN KEY ${constraintName}`);
      console.log('  ✓ Dropped old foreign key constraint');
    }

    // Add new constraint
    // Note: We need to know the column name. Assuming grn_id based on previous file.
    await conn.query(`
      ALTER TABLE qc_reports 
      ADD CONSTRAINT fk_qc_reports_grn 
      FOREIGN KEY (grn_id) 
      REFERENCES grn(id) 
      ON DELETE CASCADE
    `);
    console.log('  ✓ Added new foreign key constraint with ON DELETE CASCADE');

    // Verify
    const [verifyRows] = await conn.query(`
        SELECT DELETE_RULE 
        FROM information_schema.REFERENTIAL_CONSTRAINTS 
        WHERE CONSTRAINT_SCHEMA = 'sterling_erp' 
        AND TABLE_NAME = 'qc_reports'
        AND REFERENCED_TABLE_NAME = 'grn'
      `);
      
    if (verifyRows.length > 0 && verifyRows[0].DELETE_RULE === 'CASCADE') {
        console.log('  ✓ Verification passed: DELETE_RULE is CASCADE');
    } else {
        console.error('  ✗ Verification failed!');
    }

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    if (conn) conn.release();
    process.exit();
  }
}

migrate();
