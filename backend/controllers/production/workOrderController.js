const WorkOrder = require("../../models/WorkOrder");
const EmployeeTask = require("../../models/EmployeeTask");
const pool = require("../../config/database");

const getAllWorkOrders = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search
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
      search: req.query.search
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
        const taskTitle = `Job Card Operation: ${operationName}`;
        const taskDescription = `Operation for Work Order: ${wo ? wo.work_order_no : 'N/A'}. Item: ${wo ? wo.item_name : 'N/A'}`;

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
      "SELECT operator_id, work_order_id FROM work_order_operations WHERE id = ?",
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

      // Check if a task already exists for this operation
      const [existingTasks] = await pool.execute(
        "SELECT id, employee_id, status FROM employee_tasks WHERE work_order_operation_id = ?",
        [id]
      );
      const existingTask = existingTasks[0];

      if (!opId) {
        // Operator removed - delete task if it exists
        if (existingTask) {
          await pool.execute("DELETE FROM employee_tasks WHERE id = ?", [existingTask.id]);
          console.log(`[WorkOrderController] Deleted task ${existingTask.id} because operator was removed from operation ${id}`);
        }
      } else if (!existingTask || existingTask.employee_id != opId) {
        // Operator changed or task didn't exist - (re)create task
        if (existingTask) {
          await pool.execute("DELETE FROM employee_tasks WHERE id = ?", [existingTask.id]);
          console.log(`[WorkOrderController] Deleted existing task ${existingTask.id} for reassignment`);
        }

        // Get work order details for the task description
        const wo = await WorkOrder.findById(existingOp.work_order_id);
        
        const taskTitle = `Job Card Operation: ${operationName || (existingOp ? existingOp.operation_name : 'Unnamed')}`;
        const taskDescription = `Operation for Work Order: ${wo ? wo.work_order_no : 'N/A'}. Item: ${wo ? wo.item_name : 'N/A'}`;

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
        
        // If status was provided and different from default 'pending', update it
        if (status && status !== 'pending') {
          await pool.execute(
            "UPDATE employee_tasks SET status = ? WHERE work_order_operation_id = ?",
            [status, id]
          );
        }
        
        console.log(`[WorkOrderController] Task assigned to operator ${opId} for operation ${id}`);
      } else {
        // Same operator, check if we need to sync status or other details
        const updates = [];
        const params = [];
        
        if (status && existingTask.status !== status) {
          updates.push("status = ?");
          params.push(status);
        }
        
        if (operationName) {
          updates.push("title = ?");
          params.push(`Job Card Operation: ${operationName}`);
        }
        
        if (updates.length > 0) {
          params.push(existingTask.id);
          await pool.execute(
            `UPDATE employee_tasks SET ${updates.join(', ')} WHERE id = ?`,
            params
          );
          console.log(`[WorkOrderController] Updated existing employee task ${existingTask.id} for operation ${id}`);
        }
      }
    } catch (taskError) {
      console.warn("[WorkOrderController] Warning - could not handle employee task update:", taskError.message);
    }

    res.json({ message: "Operation updated successfully (FIXED)" });
  } catch (error) {
    console.error("Error in updateOperation:", error);
    res.status(500).json({ message: "ZENCODER_DEBUG_UPDATE_FAILED", error: error.message });
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
    
    const started = await WorkOrder.startOperation(id, operatorId, workstationId);
    if (!started) {
      return res.status(404).json({ message: "Operation not found" });
    }

    // Sync with employee task status
    try {
      await pool.query(
        "UPDATE employee_tasks SET status = 'in_progress' WHERE work_order_operation_id = ?",
        [id]
      );
    } catch (taskError) {
      console.warn("[WorkOrderController] Could not update task status:", taskError.message);
    }

    res.json({ message: "Operation started successfully (FIXED)" });
  } catch (error) {
    console.error("Error in startOperation:", error);
    res.status(500).json({ 
      message: "ZENCODER_DEBUG_START_FAILED", 
      error: error.message,
      detail: error.sqlMessage || error.code || "Unknown error"
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
  addDowntimeLog
};
