require('dotenv').config();
const pool = require('./config/database');

async function testNotificationFlow() {
  console.log('\n=== NOTIFICATION SYSTEM TEST ===\n');
  
  const connection = await pool.getConnection();
  
  try {
    console.log('1. Checking FK constraint on alerts_notifications...');
    const [constraints] = await connection.execute(`
      SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'alerts_notifications' 
      AND COLUMN_NAME = 'user_id'
    `);
    
    if (constraints.length > 0) {
      console.log(`   ✓ FK found: ${constraints[0].CONSTRAINT_NAME}`);
      console.log(`   ✓ References table: ${constraints[0].REFERENCED_TABLE_NAME}`);
    } else {
      console.log('   ⚠ No FK constraint found');
    }

    console.log('\n2. Finding production stages with assigned employees...');
    const [stages] = await connection.execute(`
      SELECT id, stage_name, assigned_employee_id 
      FROM production_plan_stages 
      WHERE assigned_employee_id IS NOT NULL 
      LIMIT 2
    `);
    
    if (stages.length === 0) {
      console.log('   ℹ No stages with assigned employees found');
      connection.release();
      await pool.end();
      return;
    }
    
    stages.forEach(stage => {
      console.log(`   - Stage ${stage.id}: "${stage.stage_name}" -> Employee ${stage.assigned_employee_id}`);
    });

    const testStage = stages[0];
    const testEmployeeId = testStage.assigned_employee_id;

    console.log(`\n3. Testing notification creation for employee ${testEmployeeId}...`);
    const [insertResult] = await connection.execute(
      `INSERT INTO alerts_notifications (user_id, alert_type, message, related_table, related_id, priority)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        testEmployeeId,
        'test_notification',
        'This is a test notification from the notification system',
        'production_plan_stages',
        testStage.id,
        'high'
      ]
    );
    console.log(`   ✓ Notification created with ID: ${insertResult.insertId}`);

    console.log('\n4. Verifying notification exists...');
    const [verifyNotif] = await connection.execute(
      `SELECT id, user_id, alert_type, message, created_at FROM alerts_notifications WHERE id = ?`,
      [insertResult.insertId]
    );
    
    if (verifyNotif.length > 0) {
      const notif = verifyNotif[0];
      console.log(`   ✓ Found notification:`);
      console.log(`     - ID: ${notif.id}`);
      console.log(`     - User ID: ${notif.user_id}`);
      console.log(`     - Type: ${notif.alert_type}`);
      console.log(`     - Message: ${notif.message}`);
      console.log(`     - Created: ${notif.created_at}`);
    }

    console.log('\n5. Checking total notifications in database...');
    const [totalCount] = await connection.execute(
      `SELECT COUNT(*) as total FROM alerts_notifications`
    );
    console.log(`   ✓ Total notifications: ${totalCount[0].total}`);

    console.log('\n6. Checking if employees table exists and has data...');
    const [empCheck] = await connection.execute(
      `SELECT COUNT(*) as count FROM employees LIMIT 1`
    );
    console.log(`   ✓ Employees in database: ${empCheck[0].count}`);

    console.log('\n=== TEST COMPLETE ===\n');
    console.log('NEXT STEPS:');
    console.log('1. Restart backend: npm run start');
    console.log('2. Create a production plan with multiple stages');
    console.log('3. Assign employees to each stage');
    console.log('4. Complete Stage 1 task to trigger notification for Stage 2');
    console.log('5. Check NotificationBell in frontend for the notification\n');

  } catch (error) {
    console.error('✗ Test failed:', error.message);
    console.error('   Code:', error.code);
    console.error('   Errno:', error.errno);
  } finally {
    connection.release();
    await pool.end();
  }
}

testNotificationFlow();
