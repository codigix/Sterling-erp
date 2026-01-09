const pool = require('./config/database');

async function check() {
  try {
    const [tasks] = await pool.execute(`
      SELECT et.id, et.title, et.status, et.production_plan_stage_id, et.employee_id, pps.stage_name
      FROM employee_tasks et
      LEFT JOIN production_plan_stages pps ON et.production_plan_stage_id = pps.id
      WHERE et.type = 'production_stage'
      ORDER BY et.created_at DESC
    `);
    
    console.log('\n=== EMPLOYEE TASKS ===');
    tasks.forEach(t => {
      console.log(`ID: ${t.id}, Title: ${t.title}, Status: ${t.status}, Stage ID: ${t.production_plan_stage_id}, Employee: ${t.employee_id}`);
    });
    
    const [stages] = await pool.execute(`
      SELECT id, stage_name, production_plan_id, assigned_employee_id, status
      FROM production_plan_stages
      ORDER BY id DESC
      LIMIT 10
    `);
    
    console.log('\n=== PRODUCTION PLAN STAGES (Last 10) ===');
    stages.forEach(s => {
      console.log(`ID: ${s.id}, Stage: ${s.stage_name}, Plan: ${s.production_plan_id}, Employee: ${s.assigned_employee_id}, Status: ${s.status}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

check();
