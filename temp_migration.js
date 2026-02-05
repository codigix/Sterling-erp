const pool = require('./backend/config/database');

async function migrate() {
  const connection = await pool.getConnection();
  try {
    console.log('Checking if production_plan_id column exists...');
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'production_plan_details' AND COLUMN_NAME = 'production_plan_id'"
    );

    if (columns.length === 0) {
      console.log('Adding production_plan_id column to production_plan_details table...');
      await connection.execute(
        `ALTER TABLE production_plan_details ADD COLUMN production_plan_id INT NULL AFTER id`
      );
      console.log('✅ Column added successfully');
      
      console.log('Adding foreign key...');
      try {
          await connection.execute(
            `ALTER TABLE production_plan_details ADD CONSTRAINT fk_pp_details_pp_id FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE CASCADE`
          );
          console.log('✅ Foreign key added');
      } catch (fkErr) {
          console.warn('Could not add foreign key (might already exist or table not empty with invalid IDs):', fkErr.message);
      }
    } else {
      console.log('✅ Column already exists');
    }

    // Try to backfill production_plan_id if possible
    console.log('Attempting to backfill production_plan_id...');
    await connection.execute(`
        UPDATE production_plan_details ppd
        JOIN production_plans pp ON 
            (pp.sales_order_id IS NOT NULL AND pp.sales_order_id = ppd.sales_order_id) OR
            (pp.root_card_id IS NOT NULL AND pp.root_card_id = ppd.root_card_id)
        SET ppd.production_plan_id = pp.id
        WHERE ppd.production_plan_id IS NULL
    `);
    console.log('✅ Backfill attempted');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrate();
