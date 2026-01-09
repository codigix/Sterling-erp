const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'sterling_erp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    const conn = await pool.getConnection();
    
    console.log('=== Checking employee_tasks structure ===');
    const [cols] = await conn.execute('DESCRIBE employee_tasks');
    cols.forEach(c => console.log(c.Field, '-', c.Type, c.Null));
    
    console.log('\n=== Sample tasks ===');
    const [tasks] = await conn.execute('SELECT id, type, employee_id, title, manufacturing_stage_id, notes FROM employee_tasks LIMIT 5');
    console.log(tasks);
    
    console.log('\n=== Manufacturing stages ===');
    const [stages] = await conn.execute('SELECT id, production_plan_id, assigned_employee_id, stage_name FROM manufacturing_stages LIMIT 5');
    console.log(stages);
    
    conn.release();
    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
  }
})();
