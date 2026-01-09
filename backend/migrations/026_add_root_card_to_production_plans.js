const pool = require('../config/database');

async function addRootCardColumn() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    console.log('Checking if root_card_id column exists...');
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'production_plans' AND COLUMN_NAME = 'root_card_id' AND TABLE_SCHEMA = 'sterling_erp'"
    );

    if (columns.length === 0) {
      console.log('Adding root_card_id column to production_plans table...');
      
      await connection.execute(
        `ALTER TABLE production_plans ADD COLUMN root_card_id INT AFTER sales_order_id`
      );
      
      console.log('Adding foreign key constraint...');
      await connection.execute(
        `ALTER TABLE production_plans ADD FOREIGN KEY (root_card_id) REFERENCES root_cards(id)`
      );
      
      console.log('✅ root_card_id column and foreign key added successfully');
    } else {
      console.log('✅ root_card_id column already exists, skipping migration');
    }

    await connection.query('COMMIT');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error adding root_card_id column:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

addRootCardColumn()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
