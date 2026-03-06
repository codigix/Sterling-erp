const WorkOrder = require("../../models/WorkOrder");
const EmployeeTask = require("../../models/EmployeeTask");
const DepartmentTask = require("../../models/DepartmentTask");
const AlertsNotification = require("../../models/AlertsNotification");
const WorkflowTaskHelper = require("../../utils/workflowTaskHelper");
const pool = require("../../config/database");

const getAllWorkOrders = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search,
      salesOrderId: req.query.salesOrderId,
      rootCardId: req.query.rootCardId,
      workOrderId: req.query.workOrderId,
      month: req.query.month,
      year: req.query.year
    };
    const workOrders = await WorkOrder.findAll(filters);
    res.json(workOrders);
  } catch (error) {
    console.error("Error in getAllWorkOrders:", error);
    res.status(500).json({ message: "Error fetching work orders" });
  }
};

const createWorkOrder = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user?.id
    };
    
    // Auto-generate WO number if not provided
    if (!payload.workOrderNo || payload.workOrderNo === 'WO-AUTO') {
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 900) + 100;
      payload.workOrderNo = `WO-${timestamp}-${randomSuffix}`;
    }
    
    const workOrderId = await WorkOrder.create(payload);

    // Complete workflow task
    if (payload.rootCardId) {
      try {
        await WorkflowTaskHelper.completeAndOpenNext(payload.rootCardId, 'Generate Work Orders');
      } catch (workflowErr) {
        console.error('[WorkOrderController] Error completing workflow task:', workflowErr.message);
      }
    }

    res.status(201).json({ 
      message: "Work order created successfully", 
      id: workOrderId,
      workOrderNo: payload.workOrderNo
    });
  } catch (error) {
    console.error("Error in createWorkOrder:", error);
    res.status(500).json({ message: "Error creating work order", error: error.message });
  }
};

const getAllJobCards = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search,
      salesOrderId: req.query.salesOrderId,
      rootCardId: req.query.rootCardId,
      workOrderId: req.query.workOrderId,
      month: req.query.month,
      year: req.query.year
    };
    const workOrders = await WorkOrder.findAllWithOperations(filters);
    res.json(workOrders);
  } catch (error) {
    console.error("Error in getAllJobCards:", error);
    res.status(500).json({ message: "Error fetching job cards" });
  }
};

const getWorkOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ message: "Work order not found" });
    }
    res.json(workOrder);
  } catch (error) {
    console.error("Error in getWorkOrderById:", error);
    res.status(500).json({ message: "Error fetching work order" });
  }
};

const updateWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await WorkOrder.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Work order not found or no changes made" });
    }
    res.json({ message: "Work order updated successfully" });
  } catch (error) {
    console.error("Error in updateWorkOrder:", error);
    res.status(500).json({ message: "Error updating work order" });
  }
};

const deleteWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await WorkOrder.delete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Work order not found" });
    }
    res.json({ message: "Work order deleted successfully" });
  } catch (error) {
    console.error("Error in deleteWorkOrder:", error);
    res.status(500).json({ message: "Error deleting work order" });
  }
};

const createOperation = async (req, res) => {
  try {
    const { operatorId, operationName, workOrderId } = req.body || {};
    const operationId = await WorkOrder.createOperation(req.body || {});
    
    // Handle task assignment if operator is assigned
    if (operatorId) {
      try {
        const wo = await WorkOrder.findById(workOrderId);
        const woNo = wo ? (wo.work_order_no?.split('-')?.pop() || wo.id) : 'N/A';
        const jcId = `JC-${woNo}-${operationId}`;
        const taskTitle = `Job Card: ${jcId} - ${operationName}`;
        const taskDescription = `Job Card ${jcId} (${operationName}) for Work Order: ${wo ? wo.work_order_no : 'N/A'}`;

        await EmployeeTask.createAssignedTask(operatorId, {
          title: taskTitle,
          description: taskDescription,
          type: 'job_card',
          priority: wo ? (wo.priority === 'critical' ? 'critical' : wo.priority === 'high' ? 'high' : 'medium') : 'medium',
          dueDate: req.body.plannedEndDate || null,
          notes: `Work Order ID: ${workOrderId}`,
          workOrderOperationId: operationId,
          salesOrderId: wo ? wo.sales_order_id : null,
          assignedBy: req.user?.id
        });

        console.log(`[WorkOrderController] Task assigned to operator ${operatorId} for new operation ${operationId}`);
      } catch (taskError) {
        console.warn("[WorkOrderController] Warning - could not create employee task:", taskError.message);
      }
    }

    res.status(201).json({ 
      message: "Job card created successfully", 
      id: operationId 
    });
  } catch (error) {
    console.error("Error in createOperation:", error);
    res.status(500).json({ message: "Error creating job card" });
  }
};

const updateOperation = async (req, res) => {
  try {
    const { id } = req.params;
    const { operatorId, operationName, status } = req.body || {};
    
    // Get existing operation before update to check if operator changed
    const [existingOps] = await pool.execute(
      "SELECT operator_id, work_order_id, operation_name FROM work_order_operations WHERE id = ?",
      [id]
    );
    const existingOp = existingOps[0];

    const updated = await WorkOrder.updateOperation(id, req.body || {});
    if (!updated) {
      return res.status(404).json({ message: "Operation not found" });
    }

    // Handle task assignment if operator is assigned or changed
    try {
      const opId = operatorId ? parseInt(operatorId) : null;
      const prevOpId = existingOp?.operator_id ? parseInt(existingOp.operator_id) : null;

      if (opId !== prevOpId) {
        // Operator changed or newly assigned
        // 1. Delete old tasks for this operation to avoid duplicates
        await pool.execute(
          "DELETE FROM employee_tasks WHERE work_order_operation_id = ?",
          [id]
        );

        // 2. Create new task if new operator is assigned
        if (opId) {
          const wo = await WorkOrder.findById(existingOp.work_order_id);
          const woNo = wo ? (wo.work_order_no?.split('-')?.pop() || wo.id) : 'N/A';
          const jcId = `JC-${woNo}-${id}`;
          const taskTitle = `Job Card: ${jcId} - ${operationName || existingOp.operation_name}`;
          const taskDescription = `Job Card ${jcId} (${operationName || existingOp.operation_name}) for Work Order: ${wo ? wo.work_order_no : 'N/A'}`;

          await EmployeeTask.createAssignedTask(opId, {
            title: taskTitle,
            description: taskDescription,
            type: 'job_card',
            priority: wo ? (wo.priority === 'critical' ? 'critical' : wo.priority === 'high' ? 'high' : 'medium') : 'medium',
            dueDate: req.body.plannedEndDate || null,
            notes: `Work Order ID: ${existingOp.work_order_id}`,
            workOrderOperationId: id,
            salesOrderId: wo ? wo.sales_order_id : null,
            assignedBy: req.user?.id
          });
          console.log(`[WorkOrderController] Task reassigned from ${prevOpId} to ${opId} for operation ${id}`);
        }
      } else if (opId) {
        // Operator same, check if task exists, if not create it
        const [existingTasks] = await pool.execute(
          "SELECT id FROM employee_tasks WHERE work_order_operation_id = ?",
          [id]
        );
        if (existingTasks.length === 0) {
          const wo = await WorkOrder.findById(existingOp.work_order_id);
          const woNo = wo ? (wo.work_order_no?.split('-')?.pop() || wo.id) : 'N/A';
          const jcId = `JC-${woNo}-${id}`;
          const taskTitle = `Job Card: ${jcId} - ${operationName || existingOp.operation_name}`;
          const taskDescription = `Job Card ${jcId} (${operationName || existingOp.operation_name}) for Work Order: ${wo ? wo.work_order_no : 'N/A'}`;

          await EmployeeTask.createAssignedTask(opId, {
            title: taskTitle,
            description: taskDescription,
            type: 'job_card',
            priority: wo ? (wo.priority === 'critical' ? 'critical' : wo.priority === 'high' ? 'high' : 'medium') : 'medium',
            dueDate: req.body.plannedEndDate || null,
            notes: `Work Order ID: ${existingOp.work_order_id}`,
            workOrderOperationId: id,
            salesOrderId: wo ? wo.sales_order_id : null,
            assignedBy: req.user?.id
          });
        }
      }
    } catch (taskError) {
      console.warn("[WorkOrderController] Warning - could not handle employee task update:", taskError.message);
    }

    res.json({ message: "Operation updated successfully" });
  } catch (error) {
    console.error("Error in updateOperation:", error);
    res.status(500).json({ message: "Error updating operation" });
  }
};

const deleteOperation = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete associated tasks first
    await pool.execute(
      "DELETE FROM employee_tasks WHERE work_order_operation_id = ?",
      [id]
    );

    const deleted = await WorkOrder.deleteOperation(id);
    if (!deleted) {
      return res.status(404).json({ message: "Operation not found" });
    }
    res.json({ message: "Operation deleted successfully" });
  } catch (error) {
    console.error("Error in deleteOperation:", error);
    res.status(500).json({ message: "Error deleting operation" });
  }
};

// --- Production Entry Controllers ---

const startOperation = async (req, res) => {
  try {
    const { id } = req.params;
    const { operatorId, workstationId } = req.body || {};
    
    // Get existing operation to get work order details
    const [existingOps] = await pool.execute(
      "SELECT * FROM work_order_operations WHERE id = ?",
      [id]
    );
    const operation = existingOps[0];
    if (!operation) {
      return res.status(404).json({ message: "Operation not found" });
    }

    const started = await WorkOrder.startOperation(id, operatorId, workstationId);
    if (!started) {
      return res.status(404).json({ message: "Operation not found" });
    }

    // Handle task assignment/update during start
    try {
      const opId = operatorId ? parseInt(operatorId) : (operation.operator_id ? parseInt(operation.operator_id) : null);
      
      if (opId) {
        // 1. Check if task exists, if not create it
        const [existingTasks] = await pool.execute(
          "SELECT id FROM employee_tasks WHERE work_order_operation_id = ?",
          [id]
        );

        if (existingTasks.length === 0) {
          const wo = await WorkOrder.findById(operation.work_order_id);
          await EmployeeTask.createAssignedTask(opId, {
            title: `Job Card Operation: ${operation.operation_name}`,
            description: `Operation for Work Order: ${wo ? wo.work_order_no : 'N/A'}`,
            type: 'job_card',
            priority: wo ? (wo.priority === 'critical' ? 'critical' : wo.priority === 'high' ? 'high' : 'medium') : 'medium',
            dueDate: operation.planned_end_date || null,
            notes: `Work Order ID: ${operation.work_order_id}`,
            workOrderOperationId: id,
            salesOrderId: wo ? wo.sales_order_id : null,
            assignedBy: req.user?.id
          });
        }

        // 2. Update task status to in_progress and SYNC STARTED_AT
        await pool.execute(
          "UPDATE employee_tasks SET status = 'in_progress', started_at = COALESCE(started_at, NOW()) WHERE work_order_operation_id = ?",
          [id]
        );
        
        // 3. Create a status update notification for the operator
        const [users] = await pool.execute(
          "SELECT u.id FROM users u JOIN employees e ON u.email = e.email WHERE e.id = ?", 
          [opId]
        );
        if (users.length > 0) {
          await AlertsNotification.create({
            userId: users[0].id,
            alertType: 'status_update',
            message: `Task "${operation.operation_name}" has been started for you.`,
            relatedTable: 'work_order_operations',
            relatedId: id,
            priority: 'medium',
            link: '/employee/tasks'
          });
        }

        console.log(`[WorkOrderController] Task status set to in_progress for operation ${id}`);
      }
    } catch (taskError) {
      console.warn("[WorkOrderController] Could not sync task during start:", taskError.message);
    }

    res.json({ message: "Operation started successfully" });
  } catch (error) {
    console.error("Error in startOperation:", error);
    res.status(500).json({ 
      message: "Failed to start operation", 
      error: error.message 
    });
  }
};

const getOperationDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const operation = await WorkOrder.getOperationById(id);
    if (!operation) {
      return res.status(404).json({ message: "Operation not found" });
    }

    const logs = await WorkOrder.getOperationLogs(id);
    res.json({
      ...operation,
      logs
    });
  } catch (error) {
    console.error("Error in getOperationDetails:", error);
    res.status(500).json({ message: "Error fetching operation details" });
  }
};

const addTimeLog = async (req, res) => {
  try {
    const { id } = req.params;
    const logId = await WorkOrder.addTimeLog({
      ...req.body,
      operationId: id
    });
    res.status(201).json({ message: "Time log added successfully", id: logId });
  } catch (error) {
    console.error("Error in addTimeLog:", error);
    res.status(500).json({ message: "Error adding time log" });
  }
};

const addQualityEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const logId = await WorkOrder.addQualityEntry({
      ...req.body,
      operationId: id
    });
    res.status(201).json({ message: "Quality entry added successfully", id: logId });
  } catch (error) {
    console.error("Error in addQualityEntry:", error);
    res.status(500).json({ message: "Error adding quality entry" });
  }
};

const addDowntimeLog = async (req, res) => {
  try {
    const { id } = req.params;
    const logId = await WorkOrder.addDowntimeLog({
      ...req.body,
      operationId: id
    });
    res.status(201).json({ message: "Downtime log added successfully", id: logId });
  } catch (error) {
    console.error("Error in addDowntimeLog:", error);
    res.status(500).json({ message: "Error adding downtime log" });
  }
};

const completeProductionEntry = async (req, res) => {
  try {
    const { id } = req.params; // operation id
    
    // 0. Get work_order_id first
    const [opRows] = await pool.execute(
      "SELECT work_order_id FROM work_order_operations WHERE id = ?",
      [id]
    );
    
    if (opRows.length === 0) {
      return res.status(404).json({ message: "Operation not found" });
    }
    
    const workOrderId = opRows[0].work_order_id;

    // 1. Mark the operation as fully completed if not already
    await pool.execute(
      "UPDATE work_order_operations SET status = 'completed', actual_end_date = NOW() WHERE id = ?",
      [id]
    );

    // 2. Mark the Department Task (Production Entry) as completed
    await pool.execute(
      "UPDATE department_tasks SET status = 'completed', updated_at = NOW() WHERE work_order_operation_id = ? AND task_title LIKE '%Production Entry%'",
      [id]
    );

    // 3. Sync employee task status to completed if not already
    await pool.execute(
      "UPDATE employee_tasks SET status = 'completed', completed_at = COALESCE(completed_at, NOW()) WHERE work_order_operation_id = ?",
      [id]
    );

    // 3.5 Pass accepted quantity to the next operation in sequence
    try {
      // Calculate total accepted quantity for this operation
      const [qualityRows] = await pool.execute(
        "SELECT SUM(accepted_qty) as total_accepted FROM work_order_quality_entries WHERE operation_id = ?",
        [id]
      );
      const totalAccepted = qualityRows[0].total_accepted || 0;

      // Find all operations for this work order to determine the next one
      const [allOps] = await pool.execute(
        "SELECT id, sequence, status FROM work_order_operations WHERE work_order_id = ? ORDER BY sequence ASC, id ASC",
        [workOrderId]
      );

      const currentIndex = allOps.findIndex(op => op.id === parseInt(id));
      if (currentIndex !== -1 && currentIndex < allOps.length - 1) {
        const nextOp = allOps[currentIndex + 1];
        
        // Update the next operation's quantity to manufacture (using work_order_qty or a specific target field)
        // Note: The user wants "that produce quantity have to pass to next job card"
        // In this system, 'target_qty' or 'work_order_qty' is used as the goal.
        // We'll update the quantity for the next operation.
        await pool.execute(
          "UPDATE work_order_operations SET quantity = ? WHERE id = ?",
          [totalAccepted, nextOp.id]
        );
        console.log(`[WorkOrderController] Passed ${totalAccepted} accepted units from operation ${id} to next operation ${nextOp.id}`);
      }
    } catch (qtyPassError) {
      console.error("[WorkOrderController] Error passing quantity to next operation:", qtyPassError.message);
      // Don't fail the whole request if this step fails, but log it
    }

    // 4. Check if all operations for this work order are completed
    const [incompleteOps] = await pool.execute(
      "SELECT id FROM work_order_operations WHERE work_order_id = ? AND status != 'completed'",
      [workOrderId]
    );

    if (incompleteOps.length === 0) {
      // All operations are completed, mark the work order as completed
      await pool.execute(
        "UPDATE work_orders SET status = 'completed', actual_end_date = NOW() WHERE id = ?",
        [workOrderId]
      );
      console.log(`[WorkOrderController] Work Order ${workOrderId} marked as completed because all operations are finished.`);

      // Complete "Execute Job Cards" workflow task if applicable
      const [woRows] = await pool.execute("SELECT root_card_id FROM work_orders WHERE id = ?", [workOrderId]);
      if (woRows.length > 0 && woRows[0].root_card_id) {
        try {
          await WorkflowTaskHelper.completeAndOpenNext(woRows[0].root_card_id, 'Execute Job Cards');
        } catch (workflowErr) {
          console.error('[WorkOrderController] Error completing Execute Job Cards task:', workflowErr.message);
        }
      }
    }

    res.json({ message: "Production entry completed and task closed" });
  } catch (error) {
    console.error("Error in completeProductionEntry:", error);
    res.status(500).json({ message: "Error completing production entry task" });
  }
};

module.exports = {
  getAllWorkOrders,
  createWorkOrder,
  getAllJobCards,
  getWorkOrderById,
  updateWorkOrder,
  deleteWorkOrder,
  createOperation,
  updateOperation,
  deleteOperation,
  startOperation,
  getOperationDetails,
  addTimeLog,
  addQualityEntry,
  addDowntimeLog,
  completeProductionEntry
};
