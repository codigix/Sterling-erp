const pool = require('../config/database');

const up = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('Starting migration: Re-indexing sales order drafts...');

    // 1. Update drafts where current_step = 2 to 1 (Sales Order Details -> Client PO)
    console.log('Updating drafts at Step 2 to Step 1...');
    await connection.execute('UPDATE sales_order_drafts SET current_step = 1 WHERE current_step = 2');

    // 2. Decrement current_step for all drafts > 2
    console.log('Decrementing current_step for drafts > 2...');
    await connection.execute('UPDATE sales_order_drafts SET current_step = current_step - 1 WHERE current_step > 2');

    await connection.commit();
    console.log('✅ Drafts re-indexed successfully');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
};

const down = async () => {
  console.log('Down migration not implemented.');
};

module.exports = { up, down };
