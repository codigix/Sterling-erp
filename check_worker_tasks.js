const pool = require('./backend/config/database');

async function checkWorkerTasks() {
  try {
    const [rows] = await pool.execute('SELECT * FROM worker_tasks');
    rows.forEach(row => {
      console.log(`Worker Task #${row.id}: ${JSON.stringify(row).substring(0, 200)}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkWorkerTasks();
