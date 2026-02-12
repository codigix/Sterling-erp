const pool = require('./backend/config/database');
async function run() {
  try {
    const [roles] = await pool.execute('SELECT id, name FROM roles');
    console.log('Roles:', roles);
    
    const [departments] = await pool.execute('SELECT id, name FROM departments');
    console.log('Departments:', departments);

    // Check recent department tasks
    const [tasks] = await pool.execute('SELECT id, task_title, role_id, created_at FROM department_tasks ORDER BY created_at DESC LIMIT 5');
    console.log('Recent Department Tasks:', tasks);

    // Check user 12
    const [user12] = await pool.execute('SELECT u.id, u.username, u.email, e.first_name, e.last_name FROM users u LEFT JOIN employees e ON u.email = e.email WHERE u.id = 12');
    console.log('User 12:', user12);

    // Test getTasksByRole API logic
    const roleId = 5;
    const [tasksFromApi] = await pool.execute(`
      SELECT dt.* FROM department_tasks dt WHERE dt.role_id = ?
    `, [roleId]);
    console.log(`Tasks for role ${roleId}:`, tasksFromApi.length);

    // Full query from DepartmentTask.js
    const [fullTasks] = await pool.execute(`
      SELECT 
          dt.*,
          rc.title as root_card_title,
          rc.code as root_card_code,
          p.name as project_name,
          so.po_number,
          so.customer
       FROM department_tasks dt
       LEFT JOIN root_cards rc ON dt.root_card_id = rc.id
       LEFT JOIN projects p ON rc.project_id = p.id
       LEFT JOIN sales_orders so ON COALESCE(dt.sales_order_id, rc.sales_order_id, p.sales_order_id) = so.id
       WHERE dt.role_id = ?
    `, [roleId]);
    console.log(`Full Tasks for role ${roleId}:`, fullTasks.length);
    if (fullTasks.length > 0) console.log('First task:', fullTasks[0].id);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
