const pool = require('./config/database');

async function checkSchemas() {
  const tables = [
    'production_plan_details',
    'design_engineering_details',
    'material_requirements_details',
    'production_plans',
    'sales_order_steps',
    'sales_order_workflow_steps',
    'department_tasks',
    'employee_tasks'
  ];

  for (const table of tables) {
    console.log(`\n--- Schema for ${table} ---`);
    try {
      const [rows] = await pool.execute(`DESCRIBE ${table}`);
      console.table(rows);
      
      const [indices] = await pool.execute(`SHOW INDEX FROM ${table}`);
      console.log(`Indices for ${table}:`);
      console.table(indices.map(idx => ({
        Table: idx.Table,
        Non_unique: idx.Non_unique,
        Key_name: idx.Key_name,
        Column_name: idx.Column_name
      })));
    } catch (err) {
      console.error(`Error describing ${table}:`, err.message);
    }
  }
  process.exit(0);
}

checkSchemas();
