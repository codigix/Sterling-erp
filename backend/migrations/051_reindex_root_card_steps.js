const pool = require('../config/database');

const up = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('Starting migration: Re-indexing root card steps...');

    // 1. Delete Step 2 (Root Card/Sales Order) from sales_order_steps
    console.log('Deleting obsolete Step 2 (sales_order) from sales_order_steps...');
    await connection.execute('DELETE FROM sales_order_steps WHERE step_id = 2');

    // 2. Decrement step_id for all steps > 2
    console.log('Decrementing step_id for steps > 2...');
    await connection.execute('UPDATE sales_order_steps SET step_id = step_id - 1 WHERE step_id > 2');

    // 3. Update step names and keys to match new constants (optional but good for consistency)
    const stepUpdates = [
      { id: 2, key: 'design_engineering', name: 'Design Engineering' },
      { id: 3, key: 'material_requirements', name: 'Material Requirements' },
      { id: 4, key: 'production_plan', name: 'Production Plan' },
      { id: 5, key: 'quality_check', name: 'Quality Check' },
      { id: 6, key: 'shipment', name: 'Shipment' },
      { id: 7, key: 'delivery', name: 'Delivery' }
    ];

    for (const step of stepUpdates) {
      await connection.execute(
        'UPDATE sales_order_steps SET step_key = ?, step_name = ? WHERE step_id = ?',
        [step.key, step.name, step.id]
      );
    }

    // 4. Update sales_orders (root_cards) current_step if it exists
    // Check if current_step column exists in sales_orders table
    const [columns] = await connection.execute('SHOW COLUMNS FROM sales_orders LIKE "current_step"');
    if (columns.length > 0) {
      console.log('Updating current_step in sales_orders...');
      await connection.execute('UPDATE sales_orders SET current_step = 1 WHERE current_step = 2');
      await connection.execute('UPDATE sales_orders SET current_step = current_step - 1 WHERE current_step > 2');
    }

    // 5. Drop sales_order_details table
    console.log('Dropping sales_order_details table...');
    await connection.execute('DROP TABLE IF EXISTS sales_order_details');

    await connection.commit();
    console.log('✅ Migration completed successfully');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
};

const down = async () => {
  // Rolling back this migration is complex as it involves recreating the table and re-indexing back
  // For now, we'll leave it empty or implement basic reversal if needed.
  console.log('Down migration not fully implemented due to complexity of re-indexing reversal.');
};

module.exports = { up, down };
