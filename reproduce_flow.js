const pool = require('./backend/config/database');
const EmployeeTask = require('./backend/models/EmployeeTask');
const WorkOrder = require('./backend/models/WorkOrder');

async function run() {
  try {
    const operationId = 100;
    const opId = 21;
    const userId = 7; // Simulate "production" manager

    console.log(`Starting simulation for Operation ${operationId}, Operator ${opId}, User ${userId}`);

    // Simulate mapping user to employee
    let employeeIdAssignedBy = null;
    const [empRows] = await pool.execute(
      "SELECT e.id FROM employees e JOIN users u ON e.email = u.email WHERE u.id = ?",
      [userId]
    );
    if (empRows.length > 0) employeeIdAssignedBy = empRows[0].id;
    console.log(`Mapped User ${userId} to Employee ID: ${employeeIdAssignedBy}`);

    // Check existing tasks
    const [existingTasks] = await pool.execute(
      "SELECT id FROM employee_tasks WHERE work_order_operation_id = ?",
      [operationId]
    );
    console.log(`Found ${existingTasks.length} existing tasks`);

    if (existingTasks.length === 0) {
      const [existingOps] = await pool.execute(
        "SELECT * FROM work_order_operations WHERE id = ?",
        [operationId]
      );
      const operation = existingOps[0];
      const wo = await WorkOrder.findById(operation.work_order_id);

      console.log(`Creating task for operation: ${operation.operation_name}`);
      const taskId = await EmployeeTask.createAssignedTask(opId, {
        title: `Job Card Operation: ${operation.operation_name}`,
        description: `Operation for Work Order: ${wo ? wo.work_order_no : 'N/A'}. Item: ${wo ? wo.item_name : 'N/A'}`,
        type: 'job_card',
        priority: 'medium',
        dueDate: operation.planned_end_date,
        notes: `SIMULATION. Work Order ID: ${operation.work_order_id}`,
        workOrderOperationId: operationId,
        salesOrderId: wo ? wo.sales_order_id : null,
        assignedBy: employeeIdAssignedBy
      });
      console.log(`✓ Task created with ID: ${taskId}`);
    }

    // Sync status
    await pool.execute(
      "UPDATE employee_tasks SET status = 'in_progress', started_at = COALESCE(started_at, NOW()) WHERE work_order_operation_id = ?",
      [operationId]
    );
    console.log('✓ Status synced to in_progress');

  } catch (err) {
    console.error('FAILED:', err);
  } finally {
    process.exit(0);
  }
}
run();
