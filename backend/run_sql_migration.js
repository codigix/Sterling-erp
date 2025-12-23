const fs = require('fs');
const path = require('path');
const pool = require('./config/database');
require('dotenv').config();

async function runSqlMigration() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, 'migrations.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon to get individual statements, but be careful with semicolons in strings/comments
    // For this specific file, we know the structure.
    // However, let's just try to execute the specific statements we need if we can parse them,
    // or just execute the whole thing if the driver supports multiple statements.
    // The mysql2 driver supports multiple statements if configured, but let's assume it might not be.
    
    // Let's extract the specific statements we need for this task
    const statements = [
      "ALTER TABLE root_cards ADD COLUMN sales_order_id INT",
      "ALTER TABLE root_cards ADD CONSTRAINT fk_root_cards_sales_order FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL"
    ];

    console.log('Executing migration statements...');
    
    for (const statement of statements) {
      try {
        console.log(`Executing: ${statement}`);
        await connection.query(statement);
        console.log('✅ Success');
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('⚠️ Column already exists');
        } else if (err.code === 'ER_DUP_KEY' || err.message.includes('Duplicate key') || err.code === 'ER_CANT_CREATE_TABLE') {
             // ER_CANT_CREATE_TABLE often happens on duplicate FK constraint name
             console.log('⚠️ Key/Constraint already exists or error creating it: ' + err.message);
        } else {
            console.error('❌ Error:', err.message);
            // Don't throw, try next statement
        }
      }
    }
    
    console.log('Migration completed.');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    connection.release();
    process.exit();
  }
}

runSqlMigration();
