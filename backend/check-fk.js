const pool = require('./config/database');
(async () => {
  const [fks] = await pool.execute("SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'employee_tasks' AND COLUMN_NAME = 'employee_id'");
  console.log('Employee Tasks FK:');
  console.log(JSON.stringify(fks, null, 2));
  process.exit(0);
})();
