const pool = require('./backend/config/database');

async function simulateCompletion() {
  const connection = await pool.getConnection();
  try {
    // 1. Create a dummy employee task
    const [taskRes] = await connection.execute(
      `INSERT INTO employee_tasks (employee_id, title, status, priority, type) 
       VALUES (?, ?, ?, ?, ?)`,
      [21, 'Test Production Task', 'in_progress', 'medium', 'job_card']
    );
    const taskId = taskRes.insertId;
    console.log('Created dummy task:', taskId);

    // 2. Call the logic from employeePortalController.js
    // I will copy the logic here to see where it fails
    const status = 'completed';
    const updatedTask = {
      id: taskId,
      title: 'Test Production Task',
      employee_id: 21,
      priority: 'medium',
      work_order_no: 'TEST-WO-123',
      work_order_operation_id: 999 // dummy
    };
    
    const [roles] = await connection.execute("SELECT id FROM roles WHERE name = 'Production' OR name = 'production_manager' ORDER BY (CASE WHEN name = 'Production' THEN 0 ELSE 1 END) LIMIT 1");
    const productionRoleId = roles.length > 0 ? roles[0].id : null;
    console.log('Production Role ID:', productionRoleId);

    let rootCardId = null;
    let salesOrderId = null;
    let operationId = updatedTask.work_order_operation_id;
    const taskTitle = `Production Entry Required: ${updatedTask.operation_name || updatedTask.title || 'New Operation'}`;

    await connection.beginTransaction();
    console.log('Started transaction');

    await connection.execute(
      `INSERT INTO department_tasks (
        root_card_id, role_id, task_title, task_description, 
        status, priority, assigned_by, notes, 
        sales_order_id, work_order_operation_id, link
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rootCardId || null, productionRoleId, taskTitle, 
        `Test Description`,
        'pending', updatedTask.priority || 'medium', 1,
        JSON.stringify({ autoFill: {} }),
        salesOrderId || null, operationId || null, '/test-link'
      ]
    );
    console.log('Inserted into department_tasks');

    await connection.commit();
    console.log('Committed transaction');

    // Check if it exists
    const [check] = await pool.execute("SELECT * FROM department_tasks WHERE task_title = ?", [taskTitle]);
    console.log('Check result:', check);

    // Cleanup
    await pool.execute("DELETE FROM department_tasks WHERE id = ?", [check[0].id]);
    await pool.execute("DELETE FROM employee_tasks WHERE id = ?", [taskId]);
    console.log('Cleanup done');

    process.exit(0);
  } catch (err) {
    console.error('Simulation failed:', err);
    if (connection) await connection.rollback();
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

simulateCompletion();
