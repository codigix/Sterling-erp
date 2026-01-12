const pool = require('./config/database');
const EmployeeTask = require('./models/EmployeeTask');

async function test() {
  try {
    console.log('=== TESTING TASK COMPLETION & NOTIFICATIONS ===\n');

    // Step 1: Get a task with production_plan_stage_id
    console.log('Step 1: Finding a task with production_plan_stage_id...');
    const [tasks] = await pool.execute(`
      SELECT et.id, et.employee_id, et.title, et.production_plan_stage_id, et.status
      FROM employee_tasks et
      WHERE et.production_plan_stage_id IS NOT NULL
      LIMIT 1
    `);

    if (tasks.length === 0) {
      console.log('❌ No tasks with production_plan_stage_id found');
      process.exit(1);
    }

    const task = tasks[0];
    console.log('✅ Found task:', task);

    // Step 2: Check current stage info
    console.log('\nStep 2: Checking stage info...');
    const [stageInfo] = await pool.execute(`
      SELECT id, stage_name, assigned_employee_id, blocked_by_stage_id, is_blocked, status
      FROM production_plan_stages
      WHERE id = ?
    `, [task.production_plan_stage_id]);

    if (stageInfo.length === 0) {
      console.log('❌ Stage not found');
      process.exit(1);
    }

    const stage = stageInfo[0];
    console.log('✅ Current stage:', stage);

    // Step 3: Check if there are any dependent stages
    console.log('\nStep 3: Checking for dependent stages...');
    const [nextStages] = await pool.execute(`
      SELECT id, stage_name, assigned_employee_id 
      FROM production_plan_stages 
      WHERE blocked_by_stage_id = ? 
      LIMIT 1
    `, [task.production_plan_stage_id]);

    if (nextStages.length > 0) {
      console.log('✅ Found next stage:', nextStages[0]);
    } else {
      console.log('⚠️ No next stage found (this is the last stage)');
    }

    // Step 4: Count current notifications
    console.log('\nStep 4: Counting notifications before update...');
    const [countBefore] = await pool.execute(`
      SELECT COUNT(*) as count FROM alerts_notifications
    `);
    console.log('Current notification count:', countBefore[0].count);

    // Step 5: Update task status to 'completed'
    console.log('\nStep 5: Updating task status to completed...');
    await EmployeeTask.updateAssignedTaskStatus(task.id, 'completed');
    console.log('✅ Task status updated');

    // Wait a moment for any async operations
    await new Promise(r => setTimeout(r, 1000));

    // Step 6: Check new notifications
    console.log('\nStep 6: Checking for new notifications...');
    const [countAfter] = await pool.execute(`
      SELECT COUNT(*) as count FROM alerts_notifications
    `);
    console.log('New notification count:', countAfter[0].count);

    if (countAfter[0].count > countBefore[0].count) {
      console.log('✅ Notifications were created!');
      const [newNotifs] = await pool.execute(`
        SELECT id, user_id, alert_type, message, created_at
        FROM alerts_notifications
        ORDER BY created_at DESC
        LIMIT 3
      `);
      console.log('Recent notifications:', newNotifs);
    } else {
      console.log('❌ No new notifications created');
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
  process.exit(0);
}

test();
