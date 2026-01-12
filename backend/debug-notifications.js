const pool = require('./config/database');

async function check() {
  try {
    const conn = await pool.getConnection();
    
    console.log('=== CHECKING production_plan_stages ===');
    const [stages] = await conn.execute(`
      SELECT id, stage_name, assigned_employee_id, is_blocked 
      FROM production_plan_stages 
      LIMIT 10
    `);
    console.log('Sample stages:', JSON.stringify(stages, null, 2));
    
    console.log('\n=== CHECKING alerts_notifications ===');
    const [notifs] = await conn.execute(`
      SELECT id, user_id, alert_type, message, created_at 
      FROM alerts_notifications 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    console.log('Recent notifications:', JSON.stringify(notifs, null, 2));
    
    console.log('\n=== CHECKING employees 18,19,20 ===');
    const [emps] = await conn.execute(`
      SELECT id, first_name, last_name, email 
      FROM employees 
      WHERE id IN (18,19,20)
    `);
    console.log('Employees:', JSON.stringify(emps, null, 2));
    
    console.log('\n=== CHECKING production_plan_stages assigned employees ===');
    const [assigned] = await conn.execute(`
      SELECT id, stage_name, assigned_employee_id, 
             COALESCE(assigned_employee_id, 'NULL') AS check_assigned
      FROM production_plan_stages 
      WHERE assigned_employee_id IS NOT NULL
      LIMIT 10
    `);
    console.log('Assigned stages:', JSON.stringify(assigned, null, 2));
    
    conn.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}
check();
