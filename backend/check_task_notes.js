const pool = require('./config/database');

async function check() {
  try {
    const [tasks] = await pool.execute(`
      SELECT id, title, notes, type
      FROM employee_tasks
      WHERE type = 'production_stage'
      ORDER BY id ASC
    `);
    
    console.log('\n=== EMPLOYEE TASKS NOTES ===');
    tasks.forEach(t => {
      console.log(`\nID: ${t.id}`);
      console.log(`Title: ${t.title}`);
      console.log(`Type: ${t.type}`);
      console.log(`Notes: ${t.notes || '(NULL)'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

check();
