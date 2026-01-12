const pool = require('./config/database');

async function check() {
  try {
    console.log('=== CHECKING FOR DUPLICATE NOTIFICATIONS ===\n');

    // Check notifications grouped by related_id
    const [notifs] = await pool.execute(`
      SELECT related_id, COUNT(*) as count, user_id, alert_type
      FROM alerts_notifications
      WHERE alert_type = 'task_assigned'
      GROUP BY related_id, user_id, alert_type
      HAVING COUNT(*) > 1
    `);

    if (notifs.length > 0) {
      console.log('❌ Found duplicate notifications:');
      notifs.forEach(n => {
        console.log(`  Task ${n.related_id}: ${n.count} notifications for user ${n.user_id}`);
      });
    } else {
      console.log('✅ No duplicate task_assigned notifications found');
    }

    // Check latest task assignments
    const [tasks] = await pool.execute(`
      SELECT et.id, et.employee_id, et.title, COUNT(an.id) as notification_count
      FROM employee_tasks et
      LEFT JOIN alerts_notifications an ON an.related_id = et.id AND an.alert_type = 'task_assigned'
      WHERE et.id >= (SELECT MAX(id) - 10 FROM employee_tasks)
      GROUP BY et.id
      ORDER BY et.id DESC
    `);

    console.log('\nLatest 10 tasks and their notification count:');
    tasks.forEach(t => {
      const status = t.notification_count > 1 ? '❌ MULTIPLE' : t.notification_count === 1 ? '✅ OK' : '⚠️ NONE';
      console.log(`  Task ${t.id}: ${status} (${t.notification_count} notifications)`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

check();
