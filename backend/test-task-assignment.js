const pool = require('./config/database');
const EmployeeTask = require('./models/EmployeeTask');

async function test() {
  try {
    console.log('=== TESTING TASK ASSIGNMENT & NOTIFICATIONS ===\n');

    // Get a stage that's not blocked
    const [stages] = await pool.execute(`
      SELECT id, stage_name, is_blocked 
      FROM production_plan_stages 
      WHERE is_blocked = 0 
      LIMIT 1
    `);

    if (stages.length === 0) {
      console.log('❌ No unblocked stages found');
      process.exit(1);
    }

    const stage = stages[0];
    console.log('Stage found:', stage);

    // Count notifications before
    const [countBefore] = await pool.execute(`
      SELECT COUNT(*) as count FROM alerts_notifications
    `);
    console.log(`Notifications before: ${countBefore[0].count}\n`);

    // Assign a task to employee 18
    console.log('Assigning task to employee 18 with production_plan_stage_id...');
    const taskId = await EmployeeTask.createAssignedTask(18, {
      title: 'Test Task Assignment',
      description: 'Testing multiple notifications',
      type: 'general',
      priority: 'high',
      productionPlanStageId: stage.id,
      dueDate: null,
      notes: 'Test task'
    });

    console.log(`✅ Task ${taskId} assigned\n`);

    // Wait and check
    await new Promise(r => setTimeout(r, 500));

    const [countAfter] = await pool.execute(`
      SELECT COUNT(*) as count FROM alerts_notifications
    `);
    console.log(`Notifications after: ${countAfter[0].count}`);
    console.log(`Difference: ${countAfter[0].count - countBefore[0].count}\n`);

    // Get the new notifications
    const [notifs] = await pool.execute(`
      SELECT id, user_id, alert_type, message, created_at
      FROM alerts_notifications
      ORDER BY created_at DESC
      LIMIT 3
    `);
    console.log('Recent notifications:');
    notifs.forEach((n, i) => {
      console.log(`${i + 1}. User ${n.user_id} - Type: ${n.alert_type} - Message: ${n.message.substring(0, 50)}...`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  }
  process.exit(0);
}

test();
