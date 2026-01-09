const pool = require('./config/database');

(async () => {
  try {
    const [stages] = await pool.execute(
      `SELECT id, stage_name, status FROM production_plan_stages WHERE production_plan_id = 12 ORDER BY id`
    );
    console.log('\nProduction Plan 12 Stages:\n');
    stages.forEach(s => {
      const checkmark = s.status === 'completed' ? '✅' : '⏳';
      console.log(`${checkmark} ${s.stage_name}: ${s.status.toUpperCase()}`);
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
