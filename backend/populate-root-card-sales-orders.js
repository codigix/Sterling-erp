const pool = require('./config/database');
require('dotenv').config();

async function populateRootCardSalesOrders() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Populating root_cards.sales_order_id from projects...\n');

    // Get all root cards with NULL sales_order_id that have a project with a sales_order_id
    const [rootCardsToUpdate] = await connection.execute(`
      SELECT rc.id, rc.project_id, p.sales_order_id
      FROM root_cards rc
      LEFT JOIN projects p ON rc.project_id = p.id
      WHERE rc.sales_order_id IS NULL 
        AND rc.project_id IS NOT NULL 
        AND p.sales_order_id IS NOT NULL
    `);

    if (rootCardsToUpdate.length === 0) {
      console.log('✅ No root cards need updating - all have sales_order_id or no project');
      console.log('\n→ Now populating department_tasks from root_cards...\n');
      
      // Now populate tasks from root cards
      await populateTasksFromRootCards(connection);
      return;
    }

    console.log(`Found ${rootCardsToUpdate.length} root cards to update\n`);

    let updated = 0;

    for (const rootCard of rootCardsToUpdate) {
      try {
        await connection.execute(
          'UPDATE root_cards SET sales_order_id = ? WHERE id = ?',
          [rootCard.sales_order_id, rootCard.id]
        );
        console.log(`✅ Root Card ${rootCard.id}: Updated with sales_order_id = ${rootCard.sales_order_id}`);
        updated++;
      } catch (err) {
        console.error(`❌ Root Card ${rootCard.id}: Error updating -`, err.message);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updated} root cards`);

    // Verify the update
    const [verification] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN sales_order_id IS NOT NULL THEN 1 ELSE 0 END) as with_sales_order,
        SUM(CASE WHEN sales_order_id IS NULL THEN 1 ELSE 0 END) as without_sales_order
      FROM root_cards
    `);

    const result = verification[0];
    console.log(`\n📈 Root Cards Status:`);
    console.log(`   Total: ${result.total}`);
    console.log(`   With sales_order_id: ${result.with_sales_order}`);
    console.log(`   Without sales_order_id: ${result.without_sales_order}`);

    console.log('\n→ Now populating department_tasks from root_cards...\n');
    
    // Now populate tasks from root cards
    await populateTasksFromRootCards(connection);

  } catch (err) {
    console.error('❌ Root card population failed:', err.message);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

async function populateTasksFromRootCards(connection) {
  try {
    // Get all tasks with NULL sales_order_id that have a root_card_id
    const [tasksToUpdate] = await connection.execute(`
      SELECT dt.id, dt.root_card_id, rc.sales_order_id
      FROM department_tasks dt
      LEFT JOIN root_cards rc ON dt.root_card_id = rc.id
      WHERE dt.sales_order_id IS NULL 
        AND dt.root_card_id IS NOT NULL 
        AND rc.sales_order_id IS NOT NULL
    `);

    if (tasksToUpdate.length === 0) {
      console.log('✅ No tasks need updating');
      console.log('\n✨ Population complete!');
      return;
    }

    console.log(`Found ${tasksToUpdate.length} tasks to update\n`);

    let updated = 0;

    for (const task of tasksToUpdate) {
      try {
        await connection.execute(
          'UPDATE department_tasks SET sales_order_id = ? WHERE id = ?',
          [task.sales_order_id, task.id]
        );
        console.log(`✅ Task ${task.id}: Updated with sales_order_id = ${task.sales_order_id}`);
        updated++;
      } catch (err) {
        console.error(`❌ Task ${task.id}: Error updating -`, err.message);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updated} tasks`);

    // Verify the update
    const [verification] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN sales_order_id IS NOT NULL THEN 1 ELSE 0 END) as with_sales_order,
        SUM(CASE WHEN sales_order_id IS NULL THEN 1 ELSE 0 END) as without_sales_order
      FROM department_tasks
    `);

    const result = verification[0];
    console.log(`\n📈 Tasks Status:`);
    console.log(`   Total: ${result.total}`);
    console.log(`   With sales_order_id: ${result.with_sales_order}`);
    console.log(`   Without sales_order_id: ${result.without_sales_order}`);

    if (result.without_sales_order === 0) {
      console.log('\n✅ All tasks now have sales_order_id!');
    }

    console.log('\n✨ Population complete!');

  } catch (err) {
    console.error('❌ Task population failed:', err.message);
    throw err;
  }
}

populateRootCardSalesOrders();
