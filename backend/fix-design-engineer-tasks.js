const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function fixDesignEngineerTasks() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🔧 Fixing Design Engineer task statuses...\n');

    const [taskIds] = await connection.execute(
      'SELECT id FROM department_tasks WHERE role_id = 4 ORDER BY id'
    );

    if (taskIds.length === 0) {
      console.log('No tasks found');
      connection.end();
      return;
    }

    console.log(`Found ${taskIds.length} tasks\n`);

    // Set first 3 to pending
    for (let i = 0; i < Math.min(3, taskIds.length); i++) {
      await connection.execute(
        'UPDATE department_tasks SET status = ? WHERE id = ?',
        ['pending', taskIds[i].id]
      );
    }
    console.log(`✅ Set 3 tasks to 'pending'`);

    // Set next 2 to in_progress
    for (let i = 3; i < Math.min(5, taskIds.length); i++) {
      await connection.execute(
        'UPDATE department_tasks SET status = ? WHERE id = ?',
        ['in_progress', taskIds[i].id]
      );
    }
    console.log(`✅ Set 2 tasks to 'in_progress'`);

    // Set next 1 to completed
    if (taskIds.length > 5) {
      await connection.execute(
        'UPDATE department_tasks SET status = ? WHERE id = ?',
        ['completed', taskIds[5].id]
      );
      console.log(`✅ Set 1 task to 'completed'`);
    }

    // Set remaining to on_hold
    for (let i = 6; i < taskIds.length; i++) {
      await connection.execute(
        'UPDATE department_tasks SET status = ? WHERE id = ?',
        ['on_hold', taskIds[i].id]
      );
    }
    if (taskIds.length > 6) {
      console.log(`✅ Set ${taskIds.length - 6} task(s) to 'on_hold'`);
    }

    console.log('\n📊 Updated Status Summary:');
    const [summary] = await connection.execute(
      'SELECT status, COUNT(*) as count FROM department_tasks WHERE role_id = 4 GROUP BY status'
    );

    summary.forEach(row => {
      console.log(`   - ${row.status}: ${row.count} task(s)`);
    });

    console.log('\n✅ Design Engineer tasks fixed!');

    connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixDesignEngineerTasks();
