const pool = require('../config/database');

async function migrate() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('Connected to database');

    try {
      console.log('Adding received_quantity column...');
      await conn.query("ALTER TABLE grn ADD COLUMN received_quantity INT DEFAULT 0 AFTER items");
      console.log('received_quantity added successfully');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('received_quantity column already exists');
      } else {
        console.error('Error adding received_quantity:', error.message);
      }
    }

    try {
      console.log('Adding inspection_status column...');
      await conn.query("ALTER TABLE grn ADD COLUMN inspection_status VARCHAR(50) DEFAULT 'pending' AFTER qc_status");
      console.log('inspection_status added successfully');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('inspection_status column already exists');
      } else {
        console.error('Error adding inspection_status:', error.message);
      }
    }

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    if (conn) conn.release();
    process.exit();
  }
}

migrate();
