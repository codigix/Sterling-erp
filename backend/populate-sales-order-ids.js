const pool = require('./config/database');
require('dotenv').config();

async function populateSalesOrderIds() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Populating sales_order_id for existing tasks...\n');

    // Get all tasks with NULL sales_order_id that have a root_card_id
    const [tasksToUpdate] = await connection.execute(`
      SELECT dt.id, dt.root_card_id, rc.sales_order_id, rc.project_id, p.sales_order_id as project_sales_order_id
      FROM department_tasks dt
      LEFT JOIN root_cards rc ON dt.root_card_id = rc.id
      LEFT JOIN projects p ON rc.project_id = p.id
      WHERE dt.sales_order_id IS NULL AND dt.root_card_id IS NOT NULL
    `);

    if (tasksToUpdate.length === 0) {
      console.log('✅ No tasks need updating - all tasks already have sales_order_id');
      connection.release();
      process.exit(0);
    }

    console.log(`Found ${tasksToUpdate.length} tasks to update\n`);

    let updated = 0;
    let skipped = 0;

    for (const task of tasksToUpdate) {
      // Try to get sales_order_id from root_card first, then from project
      const salesOrderId = task.sales_order_id || task.project_sales_order_id;

      if (salesOrderId) {
        try {
          await connection.execute(
            'UPDATE department_tasks SET sales_order_id = ? WHERE id = ?',
            [salesOrderId, task.id]
          );
          console.log(`✅ Task ${task.id}: Updated with sales_order_id = ${salesOrderId}`);
          updated++;
        } catch (err) {
          console.error(`❌ Task ${task.id}: Error updating -`, err.message);
        }
      } else {
        console.log(`⏭️  Task ${task.id}: No sales_order_id found in root_card or project`);
        skipped++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updated} tasks`);
    console.log(`   ⏭️  Skipped: ${skipped} tasks`);

    // Verify the update
    const [verification] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN sales_order_id IS NOT NULL THEN 1 ELSE 0 END) as with_sales_order,
        SUM(CASE WHEN sales_order_id IS NULL THEN 1 ELSE 0 END) as without_sales_order
      FROM department_tasks
    `);

    const result = verification[0];
    console.log(`\n📈 Final Status:`);
    console.log(`   Total tasks: ${result.total}`);
    console.log(`   With sales_order_id: ${result.with_sales_order}`);
    console.log(`   Without sales_order_id: ${result.without_sales_order}`);

    if (result.without_sales_order === 0) {
      console.log('\n✅ All tasks now have sales_order_id!');
    } else {
      console.log(`\n⚠️  ${result.without_sales_order} tasks still missing sales_order_id`);
    }

  } catch (err) {
    console.error('❌ Populate script failed:', err.message);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

populateSalesOrderIds();
