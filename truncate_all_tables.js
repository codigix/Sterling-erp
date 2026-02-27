const pool = require('./backend/config/database');

async function truncateAllTables() {
  try {
    console.log('Starting truncation of all tables...');
    
    // 1. Disable foreign key checks
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // 2. Get all table names
    const [tables] = await pool.execute('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    console.log(`Found ${tableNames.length} tables. Truncating...`);
    
    // 3. Truncate each table
    for (const tableName of tableNames) {
      try {
        await pool.execute(`TRUNCATE TABLE \`${tableName}\``);
        console.log(`✓ Truncated ${tableName}`);
      } catch (err) {
        console.error(`✗ Failed to truncate ${tableName}:`, err.message);
      }
    }
    
    // 4. Re-enable foreign key checks
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('\nAll tables truncated successfully!');
    process.exit(0);
  } catch (e) {
    console.error('Error during truncation:', e);
    process.exit(1);
  }
}

truncateAllTables();
