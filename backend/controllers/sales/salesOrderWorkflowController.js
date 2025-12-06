const pool = require('../../config/database');
const Notification = require('../../models/Notification');

const WORKFLOW_STEPS = [
  { number: 1, name: 'PO Details', type: 'po_details' },
  { number: 2, name: 'Sales Details', type: 'sales_details' },
  { number: 3, name: 'Documents Upload & Verification', type: 'documents_upload' },
  { number: 4, name: 'Designs Upload & Verification', type: 'designs_upload' },
  { number: 5, name: 'Material Request & Verification', type: 'material_request' },
  { number: 6, name: 'Production Plan & Verification', type: 'production_plan' },
  { number: 7, name: 'Quality Check & Verification', type: 'quality_check' },
  { number: 8, name: 'Shipment & Update', type: 'shipment' },
  { number: 9, name: 'Delivered', type: 'delivered' },
];

// Initialize workflow for a new sales order
exports.initializeWorkflow = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { salesOrderId } = req.body;

    if (!salesOrderId) {
      return res.status(400).json({ message: 'Sales Order ID is required' });
    }

    // Check if sales order exists
    const [orders] = await connection.execute(
      'SELECT id FROM sales_orders WHERE id = ?',
      [salesOrderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Sales Order not found' });
    }

    // Check if workflow already initialized
    const [existingSteps] = await connection.execute(
      'SELECT COUNT(*) as count FROM sales_order_workflow_steps WHERE sales_order_id = ?',
      [salesOrderId]
    );

    if (existingSteps[0].count > 0) {
      return res.status(400).json({ message: 'Workflow already initialized for this sales order' });
    }

    // Create all workflow steps
    const results = [];
    for (const step of WORKFLOW_STEPS) {
      const [result] = await connection.execute(
        `INSERT INTO sales_order_workflow_steps 
        (sales_order_id, step_number, step_name, step_type, status)
        VALUES (?, ?, ?, ?, 'pending')`,
        [salesOrderId, step.number, step.name, step.type]
      );
      results.push(result.insertId);
    }

    // Update sales order status
    await connection.execute(
      'UPDATE sales_orders SET workflow_status = ?, current_step = 1 WHERE id = ?',
      ['in_progress', salesOrderId]
    );

    res.json({
      message: 'Workflow initialized successfully',
      salesOrderId,
      stepsCreated: WORKFLOW_STEPS.length,
    });
  } catch (error) {
    console.error('Initialize workflow error:', error);
    res.status(500).json({ message: 'Failed to initialize workflow' });
  } finally {
    connection.release();
  }
};

// Get workflow steps for a sales order
exports.getWorkflowSteps = async (req, res) => {
  try {
    const { salesOrderId } = req.params;

    const [steps] = await pool.execute(
      `SELECT 
        id, sales_order_id, step_number, step_name, step_type, status,
        assigned_employee_id, assigned_at, started_at, completed_at,
        rejected_reason, notes, documents, verification_data
      FROM sales_order_workflow_steps
      WHERE sales_order_id = ?
      ORDER BY step_number ASC`,
      [salesOrderId]
    );

    // Get employee details for assigned steps
    const stepsWithDetails = await Promise.all(
      steps.map(async (step) => {
        if (step.assigned_employee_id) {
          const [employees] = await pool.execute(
            'SELECT id, first_name, last_name, email FROM employees WHERE id = ?',
            [step.assigned_employee_id]
          );
          step.assignedEmployee = employees[0] || null;
        }
        return step;
      })
    );

    res.json({ steps: stepsWithDetails });
  } catch (error) {
    console.error('Get workflow steps error:', error);
    res.status(500).json({ message: 'Failed to load workflow steps' });
  }
};

// Assign employee to a workflow step
exports.assignEmployeeToStep = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { stepId, employeeId, reason } = req.body;
    const userId = req.user?.id || req.user?.userId;

    if (!stepId || !employeeId) {
      return res.status(400).json({ message: 'Step ID and Employee ID are required' });
    }

    // Get step details
    const [steps] = await connection.execute(
      `SELECT 
        id, sales_order_id, step_number, step_name, step_type, status
      FROM sales_order_workflow_steps
      WHERE id = ?`,
      [stepId]
    );

    if (steps.length === 0) {
      return res.status(404).json({ message: 'Workflow step not found' });
    }

    const step = steps[0];

    // Verify employee exists
    const [employees] = await connection.execute(
      'SELECT id, first_name, last_name, email FROM employees WHERE id = ?',
      [employeeId]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const employee = employees[0];

    // Start transaction
    await connection.query('START TRANSACTION');

    // Update workflow step with assignment
    await connection.execute(
      `UPDATE sales_order_workflow_steps 
      SET assigned_employee_id = ?, assigned_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [employeeId, stepId]
    );

    // Record assignment
    await connection.execute(
      `INSERT INTO sales_order_step_assignments 
      (workflow_step_id, employee_id, assigned_by, reason)
      VALUES (?, ?, ?, ?)`,
      [stepId, employeeId, userId || null, reason || null]
    );

    // Create task in employee dashboard (simple record in a task table)
    try {
      await connection.execute(
        `INSERT INTO employee_tasks (employee_id, title, description, type, priority, status, related_id, related_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employeeId,
          `${step.step_name} - Sales Order #${step.sales_order_id}`,
          `Please complete: ${step.step_name} for Sales Order #${step.sales_order_id}`,
          'sales_order_step',
          'high',
          'pending',
          step.sales_order_id,
          'sales_order',
        ]
      );
    } catch (err) {
      // Table might not exist, log error but continue
      console.error('Error creating employee task:', err.message);
    }

    // Send notification
    const notificationData = {
      userId: employeeId,
      message: `You have been assigned to: ${step.step_name} for Sales Order #${step.sales_order_id}`,
      type: 'task_assignment',
      relatedId: step.sales_order_id,
      relatedType: 'sales_order',
    };

    await Notification.create(notificationData);

    await connection.query('COMMIT');

    res.json({
      message: 'Employee assigned successfully',
      assignment: {
        stepId,
        employeeId,
        employeeName: `${employee.first_name} ${employee.last_name}`,
        employeeEmail: employee.email,
        assignedAt: new Date().toISOString(),
      },
      taskCreated: true,
    });
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('Assign employee error:', error);
    res.status(500).json({ message: 'Failed to assign employee' });
  } finally {
    connection.release();
  }
};

// Update step status
exports.updateStepStatus = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { stepId, status, rejectionReason, verificationData, notes } = req.body;
    const userId = req.user?.id || req.user?.userId;

    if (!stepId || !status) {
      return res.status(400).json({ message: 'Step ID and Status are required' });
    }

    const validStatuses = ['pending', 'in_progress', 'completed', 'rejected', 'on_hold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Get current step details
    const [steps] = await connection.execute(
      `SELECT 
        id, sales_order_id, step_number, step_name, status as old_status, 
        assigned_employee_id
      FROM sales_order_workflow_steps
      WHERE id = ?`,
      [stepId]
    );

    if (steps.length === 0) {
      return res.status(404).json({ message: 'Workflow step not found' });
    }

    const step = steps[0];

    await connection.query('START TRANSACTION');

    // Build update query with dynamic fields
    let updateQuery = 'UPDATE sales_order_workflow_steps SET status = ?, updated_at = CURRENT_TIMESTAMP';
    const updateParams = [status];

    if (status === 'in_progress' && !step.started_at) {
      updateQuery += ', started_at = CURRENT_TIMESTAMP';
    }

    if (status === 'completed') {
      updateQuery += ', completed_at = CURRENT_TIMESTAMP';
      if (verificationData) {
        updateQuery += ', verification_data = ?';
        updateParams.push(JSON.stringify(verificationData));
      }
    }

    if (status === 'rejected' && rejectionReason) {
      updateQuery += ', rejected_reason = ?';
      updateParams.push(rejectionReason);
    }

    if (notes) {
      updateQuery += ', notes = ?';
      updateParams.push(notes);
    }

    updateQuery += ' WHERE id = ?';
    updateParams.push(stepId);

    await connection.execute(updateQuery, updateParams);

    // Record audit
    await connection.execute(
      `INSERT INTO sales_order_step_audits 
      (workflow_step_id, changed_by, old_status, new_status, change_reason)
      VALUES (?, ?, ?, ?, ?)`,
      [stepId, userId || null, step.old_status, status, rejectionReason || null]
    );

    // Send notification to assigned employee
    if (step.assigned_employee_id) {
      try {
        const notificationData = {
          userId: step.assigned_employee_id,
          message: `Status updated to ${status} for step: ${step.step_name}`,
          type: 'step_status_update',
          relatedId: step.sales_order_id,
          relatedType: 'sales_order',
        };

        await Notification.create(notificationData);
      } catch (err) {
        console.error('Error sending notification:', err.message);
      }
    }

    // Check if current step is completed to move to next step
    if (status === 'completed') {
      const nextStepNumber = step.step_number + 1;
      const [nextSteps] = await connection.execute(
        `SELECT id FROM sales_order_workflow_steps 
        WHERE sales_order_id = ? AND step_number = ?`,
        [step.sales_order_id, nextStepNumber]
      );

      if (nextSteps.length > 0) {
        await connection.execute(
          `UPDATE sales_orders 
          SET current_step = ? WHERE id = ?`,
          [nextStepNumber, step.sales_order_id]
        );
      } else {
        // All steps completed
        await connection.execute(
          `UPDATE sales_orders 
          SET workflow_status = 'completed', current_step = 9 WHERE id = ?`,
          [step.sales_order_id]
        );
      }
    }

    await connection.query('COMMIT');

    res.json({
      message: 'Step status updated successfully',
      stepId,
      oldStatus: step.old_status,
      newStatus: status,
    });
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('Update step status error:', error);
    res.status(500).json({ message: 'Failed to update step status' });
  } finally {
    connection.release();
  }
};

// Upload documents for a step
exports.uploadStepDocuments = async (req, res) => {
  try {
    const { stepId } = req.params;
    const files = req.files || [];

    if (!stepId) {
      return res.status(400).json({ message: 'Step ID is required' });
    }

    if (files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Get current documents
    const [steps] = await pool.execute(
      'SELECT documents FROM sales_order_workflow_steps WHERE id = ?',
      [stepId]
    );

    if (steps.length === 0) {
      return res.status(404).json({ message: 'Workflow step not found' });
    }

    let currentDocs = [];
    try {
      currentDocs = JSON.parse(steps[0].documents || '[]');
    } catch (err) {
      currentDocs = [];
    }

    // Add new files
    const newDocs = files.map((file) => ({
      name: file.originalname,
      path: file.path,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));

    const allDocs = [...currentDocs, ...newDocs];

    // Save documents
    await pool.execute(
      'UPDATE sales_order_workflow_steps SET documents = ? WHERE id = ?',
      [JSON.stringify(allDocs), stepId]
    );

    res.json({
      message: 'Documents uploaded successfully',
      filesCount: newDocs.length,
      totalDocuments: allDocs.length,
    });
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({ message: 'Failed to upload documents' });
  }
};

// Get workflow details with audit history
exports.getWorkflowDetails = async (req, res) => {
  try {
    const { salesOrderId } = req.params;

    // Get sales order info
    const [orders] = await pool.execute(
      `SELECT id, po_number, customer, status, workflow_status, current_step,
        estimated_completion_date, created_at
      FROM sales_orders WHERE id = ?`,
      [salesOrderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Sales Order not found' });
    }

    // Get all workflow steps with details
    const [steps] = await pool.execute(
      `SELECT 
        id, step_number, step_name, step_type, status,
        assigned_employee_id, assigned_at, started_at, completed_at,
        rejected_reason, notes, documents
      FROM sales_order_workflow_steps
      WHERE sales_order_id = ?
      ORDER BY step_number ASC`,
      [salesOrderId]
    );

    // Enrich steps with employee and audit info
    const enrichedSteps = await Promise.all(
      steps.map(async (step) => {
        let assignedEmployee = null;

        if (step.assigned_employee_id) {
          const [employees] = await pool.execute(
            'SELECT id, username, email FROM users WHERE id = ?',
            [step.assigned_employee_id]
          );
          assignedEmployee = employees[0] || null;
        }

        // Get audit history
        const [audits] = await pool.execute(
          `SELECT changed_by, old_status, new_status, change_reason, timestamp
          FROM sales_order_step_audits
          WHERE workflow_step_id = ?
          ORDER BY timestamp DESC`,
          [step.id]
        );

        return {
          ...step,
          assignedEmployee,
          auditHistory: audits,
          documents: step.documents ? JSON.parse(step.documents) : [],
        };
      })
    );

    const progressPercentage = Math.round(
      (enrichedSteps.filter((s) => s.status === 'completed').length / enrichedSteps.length) * 100
    );

    res.json({
      salesOrder: orders[0],
      steps: enrichedSteps,
      progressPercentage,
      totalSteps: enrichedSteps.length,
      completedSteps: enrichedSteps.filter((s) => s.status === 'completed').length,
    });
  } catch (error) {
    console.error('Get workflow details error:', error);
    res.status(500).json({ message: 'Failed to load workflow details' });
  }
};

// Get workflow statistics
exports.getWorkflowStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT
        COUNT(DISTINCT sales_order_id) as total_orders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_steps,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_steps,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_steps,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_steps,
        COUNT(*) as total_steps
      FROM sales_order_workflow_steps
    `);

    res.json({ stats: stats[0] });
  } catch (error) {
    console.error('Get workflow stats error:', error);
    res.status(500).json({ message: 'Failed to load workflow statistics' });
  }
};

module.exports = exports;
