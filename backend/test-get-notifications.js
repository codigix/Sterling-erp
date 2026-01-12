const pool = require('./config/database');
const AlertsNotification = require('./models/AlertsNotification');

async function test() {
  try {
    console.log('=== TESTING NOTIFICATION RETRIEVAL ===\n');

    // Get notifications for employee 18
    console.log('Getting notifications for employee 18...');
    const notifs = await AlertsNotification.findByUserId(18);
    
    console.log(`Total notifications returned: ${notifs.length}\n`);
    
    // Group by related_id to see if there are duplicates
    const grouped = {};
    notifs.forEach(n => {
      const key = `${n.alert_type}_${n.related_id}`;
      grouped[key] = (grouped[key] || 0) + 1;
    });

    console.log('Grouped notifications:');
    Object.entries(grouped).forEach(([key, count]) => {
      const status = count > 1 ? '❌ DUPLICATE' : '✅ OK';
      console.log(`  ${key}: ${count} ${status}`);
    });

    console.log('\nAll notifications:');
    notifs.forEach((n, i) => {
      console.log(`${i + 1}. Type: ${n.alert_type}, Related: ${n.related_id}, Read: ${n.is_read}, Created: ${n.created_at}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  }
  process.exit(0);
}

test();
