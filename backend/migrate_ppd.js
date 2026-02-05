const mysql = require('mysql2/promise');
const config = {
  host: 'localhost',
  user: 'root',
  password: 'Kale@1234',
  database: 'sterling_erp'
};

async function main() {
  const connection = await mysql.createConnection(config);
  try {
    console.log('Starting migration to add root_card_id to production_plan_details...');
    
    // 1. Add root_card_id column
    await connection.execute(`
      ALTER TABLE production_plan_details 
      ADD COLUMN root_card_id INT NULL AFTER sales_order_id
    `);
    console.log('Added root_card_id column.');

    // 2. Add foreign key for root_card_id
    await connection.execute(`
      ALTER TABLE production_plan_details
      ADD CONSTRAINT fk_ppd_root_card FOREIGN KEY (root_card_id) REFERENCES root_cards(id) ON DELETE CASCADE
    `);
    console.log('Added foreign key for root_card_id.');

    // 3. Migrate data: If a production_plan exists with root_card_id but no sales_order_id, 
    // and production_plan_details has that ID in sales_order_id, move it.
    
    const [plans] = await connection.execute(`
      SELECT id, sales_order_id, root_card_id 
      FROM production_plans 
      WHERE root_card_id IS NOT NULL AND sales_order_id IS NULL
    `);

    for (const plan of plans) {
      // Check if details exist with this ID in sales_order_id
      const [details] = await connection.execute(
        'SELECT id FROM production_plan_details WHERE sales_order_id = ?',
        [plan.root_card_id]
      );

      if (details.length > 0) {
        console.log(`Migrating details for Root Card ${plan.root_card_id}...`);
        await connection.execute(
          'UPDATE production_plan_details SET root_card_id = ?, sales_order_id = NULL WHERE sales_order_id = ?',
          [plan.root_card_id, plan.root_card_id]
        );
      }
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await connection.end();
  }
}

main();
