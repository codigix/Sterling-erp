const fs = require('fs');
const path = require('path');
const pool = require('./backend/config/database');

async function runMigration() {
  try {
    const migrationFile = path.join(__dirname, 'backend', 'migrations.sql');
    const sql = fs.readFileSync(migrationFile, 'utf-8');
    
    const statements = sql.split(';').filter(s => s.trim());
    
    let executed = 0;
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (!trimmed) continue;
      
      try {
        await pool.execute(trimmed);
        executed++;
        console.log(`✓ Executed statement ${executed}`);
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠ Statement already exists (skipped): ${trimmed.substring(0, 50)}...`);
        } else {
          console.error(`✗ Error executing statement: ${err.message}`);
          console.error(`  Statement: ${trimmed.substring(0, 100)}...`);
        }
      }
    }
    
    console.log(`\nMigration complete. Executed ${executed} statements.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
