const pool = require('./config/database');
const EmployeeTask = require('./models/EmployeeTask');

async function test() {
  try {
    console.log('=== COMPLETING MULTIPLE TASKS ===\n');

    const [tasks] = await pool.execute(`
      SELECT et.id, et.employee_id, et.title, et.production_plan_stage_id, et.status
      FROM employee_tasks et
      WHERE et.production_plan_stage_id IS NOT NULL
      AND et.status != 'completed'
      LIMIT 3
    `);

    console.log(`Found ${tasks.length} incomplete tasks\n`);

    for (const task of tasks) {
      console.log(`Completing task ${task.id}: "${task.title}"...`);
      try {
        await EmployeeTask.updateAssignedTaskStatus(task.id, 'completed');
        console.log(`✅ Task ${task.id} completed\n`);
      } catch (err) {
        console.log(`❌ Error completing task ${task.id}: ${err.message}\n`);
      }
    }

    // Check notifications
    const [notifs] = await pool.execute(`
      SELECT id, user_id, alert_type, message, created_at
      FROM alerts_notifications
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log('\n=== FINAL NOTIFICATIONS ===');
    console.log(`Total notifications: ${notifs.length}`);
    notifs.forEach((n, i) => {
      console.log(`\n${i + 1}. For Employee ${n.user_id}:`);
      console.log(`   Type: ${n.alert_type}`);
      console.log(`   Message: ${n.message}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

test();
