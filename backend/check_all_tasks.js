const pool = require('./config/database');

(async () => {
  try {
    const [tasks] = await pool.execute(
      `SELECT et.id, et.title, et.status, et.production_plan_stage_id, pps.stage_name
       FROM employee_tasks et
       LEFT JOIN production_plan_stages pps ON et.production_plan_stage_id = pps.id
       WHERE et.type = 'production_stage'
       ORDER BY et.id`
    );
    
    console.log('\nEmployee Tasks vs Production Plan Stages:\n');
    tasks.forEach(t => {
      const taskCheckmark = t.status === 'completed' ? '✅' : '⏳';
      console.log(`${taskCheckmark} Task ${t.id}: ${t.title} = ${t.status.toUpperCase()}`);
    });
    
    const [stages] = await pool.execute(
      `SELECT id, stage_name, status FROM production_plan_stages WHERE production_plan_id = 12 ORDER BY id`
    );
    
    console.log('\nProduction Plan Stages:\n');
    stages.forEach(s => {
      const stageCheckmark = s.status === 'completed' ? '✅' : '⏳';
      console.log(`${stageCheckmark} Stage ${s.id}: ${s.stage_name} = ${s.status.toUpperCase()}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
