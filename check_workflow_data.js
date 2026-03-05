const pool = require('./backend/config/database');
(async () => {
  try {
    const tables = ['inventory_workflow_steps', 'production_workflow_steps', 'design_workflow_steps', 'sales_order_workflow_steps'];
    for (const table of tables) {
      const [rows] = await pool.execute(`SELECT * FROM ${table}`);
      console.log(`Table: ${table} - Count: ${rows.length}`);
      if (rows.length > 0) {
        console.log(JSON.stringify(rows, null, 2));
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
