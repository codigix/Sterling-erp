require('dotenv').config();
const pool = require('./config/database');

async function diagnose() {
  console.log('\n=== NOTIFICATION SYSTEM DIAGNOSTIC ===\n');
  
  const connection = await pool.getConnection();
  
  try {
    console.log('1. Checking table structure...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN ('alerts_notifications', 'employees', 'production_plan_stages')
    `);
    
    console.log(`   ✓ Found ${tables.length} required tables`);
    tables.forEach(t => console.log(`     - ${t.TABLE_NAME}`));

    console.log('\n2. Checking alerts_notifications columns...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'alerts_notifications'
      ORDER BY ORDINAL_POSITION
    `);
    
    if (columns.length === 0) {
      console.log('   ✗ alerts_notifications table does not exist!');
    } else {
      console.log(`   ✓ Found ${columns.length} columns:`);
      columns.forEach(c => {
        console.log(`     - ${c.COLUMN_NAME}: ${c.DATA_TYPE} (NULL: ${c.IS_NULLABLE})`);
      });
    }

    console.log('\n3. Checking foreign key constraint...');
    const [constraints] = await connection.execute(`
      SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME, COLUMN_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'alerts_notifications'
      AND COLUMN_NAME = 'user_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    if (constraints.length === 0) {
      console.log('   ⚠ NO FOREIGN KEY CONSTRAINT FOUND!');
      console.log('   You must run: node migrations/036_fix_alerts_notifications_fk.js');
    } else {
      const fk = constraints[0];
      console.log(`   ✓ FK: ${fk.CONSTRAINT_NAME}`);
      console.log(`   ✓ References: ${fk.REFERENCED_TABLE_NAME}(${fk.REFERENCED_COLUMN_NAME})`);
    }

    console.log('\n4. Checking employees...');
    const [employees] = await connection.execute(`
      SELECT id, CONCAT(first_name, ' ', last_name) as name, email 
      FROM employees 
      WHERE status = 'active'
      LIMIT 5
    `);
    
    console.log(`   ✓ Found ${employees.length} active employees:`);
    employees.forEach(e => {
      console.log(`     - ID ${e.id}: ${e.name} (${e.email})`);
    });

    console.log('\n5. Checking production stages...');
    const [stages] = await connection.execute(`
      SELECT id, stage_name, assigned_employee_id, is_blocked, blocked_by_stage_id
      FROM production_plan_stages 
      WHERE assigned_employee_id IS NOT NULL
      LIMIT 5
    `);
    
    console.log(`   ✓ Found ${stages.length} stages with assigned employees:`);
    stages.forEach(s => {
      console.log(`     - Stage ${s.id}: "${s.stage_name}" -> Employee ${s.assigned_employee_id} (blocked: ${s.is_blocked})`);
    });

    console.log('\n6. Checking existing notifications...');
    const [notifs] = await connection.execute(`
      SELECT id, user_id, alert_type, message, created_at FROM alerts_notifications 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (notifs.length === 0) {
      console.log('   ⚠ NO NOTIFICATIONS IN DATABASE');
    } else {
      console.log(`   ✓ Found ${notifs.length} notifications:`);
      notifs.forEach(n => {
        console.log(`     - ID ${n.id}: User ${n.user_id}, Type: ${n.alert_type}, Created: ${n.created_at}`);
      });
    }

    console.log('\n7. Testing notification insertion...');
    if (employees.length > 0) {
      const testEmpId = employees[0].id;
      console.log(`   Attempting to insert notification for employee ${testEmpId}...`);
      
      try {
        const [result] = await connection.execute(
          `INSERT INTO alerts_notifications (user_id, alert_type, message, related_table, related_id, priority)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            testEmpId,
            'test_notification',
            'Test notification from diagnostic script',
            'employees',
            testEmpId,
            'high'
          ]
        );
        
        console.log(`   ✓ INSERT successful! ID: ${result.insertId}`);
        
        const [verify] = await connection.execute(
          `SELECT id, user_id, alert_type, message FROM alerts_notifications WHERE id = ?`,
          [result.insertId]
        );
        
        if (verify.length > 0) {
          console.log(`   ✓ Verified in database`);
        }
      } catch (error) {
        console.error(`   ✗ INSERT FAILED: ${error.message}`);
        console.error(`   Code: ${error.code}, Errno: ${error.errno}`);
      }
    }

    console.log('\n8. Checking EmployeeTask.js for notification code...');
    const fs = require('fs');
    const taskModelPath = './models/EmployeeTask.js';
    const content = fs.readFileSync(taskModelPath, 'utf8');
    
    if (content.includes('pool.execute') && content.includes('INSERT INTO alerts_notifications')) {
      console.log('   ✓ EmployeeTask.js has pool.execute for notifications');
    } else if (content.includes('AlertsNotification.create')) {
      console.log('   ⚠ EmployeeTask.js still uses AlertsNotification.create() (OLD VERSION)');
      console.log('   You need to update it to use pool.execute() instead');
    }

    console.log('\n=== DIAGNOSTIC COMPLETE ===\n');

  } catch (error) {
    console.error('✗ Diagnostic failed:', error.message);
  } finally {
    connection.release();
    await pool.end();
  }
}

diagnose();
