const pool = require('../config/database');

async function migrate() {
  try {
    console.log('Checking vendors table structure...');

    const [columns] = await pool.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME='vendors' AND TABLE_SCHEMA='sterling_erp'
    `);

    const columnNames = columns.map(col => col.COLUMN_NAME);

    const requiredColumns = {
      'email': 'VARCHAR(100)',
      'phone': 'VARCHAR(20)',
      'address': 'VARCHAR(500)',
      'category': 'VARCHAR(100)',
      'rating': 'DECIMAL(3,2)',
      'status': "ENUM('active', 'inactive')",
      'total_orders': 'INT',
      'total_value': 'DECIMAL(15,2)',
      'last_order_date': 'DATE',
      'updated_at': 'TIMESTAMP'
    };

    for (const [colName, colType] of Object.entries(requiredColumns)) {
      if (!columnNames.includes(colName)) {
        console.log(`Adding column: ${colName}...`);
        
        if (colName === 'updated_at') {
          await pool.execute(`
            ALTER TABLE vendors ADD COLUMN ${colName} TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          `);
        } else if (colName === 'rating') {
          await pool.execute(`
            ALTER TABLE vendors ADD COLUMN ${colName} DECIMAL(3,2) DEFAULT 0.00
          `);
        } else if (colName === 'status') {
          await pool.execute(`
            ALTER TABLE vendors ADD COLUMN ${colName} ENUM('active', 'inactive') DEFAULT 'active'
          `);
        } else if (colName === 'total_orders') {
          await pool.execute(`
            ALTER TABLE vendors ADD COLUMN ${colName} INT DEFAULT 0
          `);
        } else if (colName === 'total_value') {
          await pool.execute(`
            ALTER TABLE vendors ADD COLUMN ${colName} DECIMAL(15,2) DEFAULT 0.00
          `);
        } else {
          await pool.execute(`
            ALTER TABLE vendors ADD COLUMN ${colName} ${colType}
          `);
        }
      }
    }

    console.log('✅ Vendors table migration completed');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  }
}

module.exports = { migrate };
