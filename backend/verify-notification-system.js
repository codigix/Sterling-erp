const pool = require('./config/database');
require('dotenv').config();

async function verifySystem() {
  console.log('\n=== STERLING ERP NOTIFICATION SYSTEM VERIFICATION ===\n');
  
  const connection = await pool.getConnection();
  
  try {
    console.log('1. Checking alerts_notifications table...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'alerts_notifications' AND TABLE_SCHEMA = DATABASE()
    `);
    if (tables.length > 0) {
      console.log('   ✓ Table exists\n');
    } else {
      console.log('   ✗ Table NOT FOUND - Run migration 035\n');
    }

    console.log('2. Checking production_plan_stages blocking columns...');
    const [cols] = await connection.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'production_plan_stages' AND TABLE_SCHEMA = DATABASE()
      AND COLUMN_NAME IN ('is_blocked', 'blocked_by_stage_id')
    `);
    if (cols.length === 2) {
      console.log('   ✓ Both columns exist\n');
    } else {
      console.log('   ✗ Columns missing - Run migration 034\n');
    }

    console.log('3. Checking for any notifications in database...');
    const [notifs] = await connection.execute(`
      SELECT COUNT(*) as count FROM alerts_notifications
    `);
    console.log(`   ℹ Total notifications: ${notifs[0].count}\n`);

    console.log('4. Checking sample production stages...');
    const [stages] = await connection.execute(`
      SELECT id, stage_name, is_blocked, blocked_by_stage_id, assigned_employee_id
      FROM production_plan_stages 
      LIMIT 5
    `);
    if (stages.length > 0) {
      console.log('   Found sample stages:');
      stages.forEach(stage => {
        console.log(`   - Stage ${stage.id}: "${stage.stage_name}", Blocked: ${stage.is_blocked}, Employee: ${stage.assigned_employee_id}`);
      });
      console.log('');
    } else {
      console.log('   ℹ No production stages found\n');
    }

    console.log('5. Checking employee tasks...');
    const [tasks] = await connection.execute(`
      SELECT COUNT(*) as count FROM employee_tasks WHERE production_plan_stage_id IS NOT NULL
    `);
    console.log(`   ℹ Tasks linked to production stages: ${tasks[0].count}\n`);

    console.log('=== VERIFICATION COMPLETE ===\n');
    console.log('NEXT STEPS:');
    console.log('1. Restart backend server (npm start)');
    console.log('2. Restart frontend dev server (npm run dev)');
    console.log('3. Login as Employee A');
    console.log('4. Create production plan with 2+ stages');
    console.log('5. Employee A completes stage 1');
    console.log('6. Check NotificationBell for stage_ready notification to Employee B\n');

  } catch (error) {
    console.error('✗ Verification failed:', error.message);
  } finally {
    connection.release();
    await pool.end();
  }
}

verifySystem();
