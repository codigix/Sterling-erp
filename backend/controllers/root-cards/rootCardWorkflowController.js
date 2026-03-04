const pool = require('../../config/database');
const Notification = require('../../models/Notification');
const EmployeeTask = require('../../models/EmployeeTask');
const RootCardStep = require('../../models/RootCardStep');

const WORKFLOW_STEPS = [
  { number: 1, name: 'PO Details', type: 'po_details' },
  { number: 2, name: 'Design Engineering', type: 'design_engineering' },
  { number: 3, name: 'Material Requirements', type: 'material_requirement' },
  { number: 4, name: 'Production Plan', type: 'production_plan' },
  { number: 5, name: 'Quality Check', type: 'quality_check' },
  { number: 6, name: 'Shipment', type: 'shipment' },
  { number: 7, name: 'Delivery', type: 'delivery' },
];

// Initialize workflow for a new root card
exports.initializeWorkflow = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { rootCardId } = req.body;

    if (!rootCardId) {
      return res.status(400).json({ message: 'Root Card ID is required' });
    }

    // Check if root card exists
    const [rootCards] = await connection.execute(
      'SELECT id FROM sales_orders WHERE id = ?',
      [rootCardId]
    );

    if (rootCards.length === 0) {
      return res.status(404).json({ message: 'Root Card not found' });
    }

    // Check if workflow already initialized
    const [existingSteps] = await connection.execute(
      'SELECT COUNT(*) as count FROM sales_order_workflow_steps WHERE sales_order_id = ?',
      [rootCardId]
    );

    if (existingSteps[0].count > 0) {
      return res.status(400).json({ message: 'Workflow already initialized for this root card' });
    }

    // Start transaction
    await connection.query('START TRANSACTION');

    // Initialize all steps in both tables using centralized method
    await RootCardStep.initializeAllSteps(rootCardId, connection);

    await connection.query('COMMIT');

    res.json({
      message: 'Workflow initialized successfully',
      rootCardId,
      stepsCreated: RootCardStep.STEP_DEFINITIONS.length,
    });
  } catch (error) {
    console.error('Initialize workflow error:', error);
    res.status(500).json({ message: 'Failed to initialize workflow' });
  } finally {
    connection.release();
  }
};

// Get workflow steps for a root card
exports.getWorkflowSteps = async (req, res) => {
  try {
    const { rootCardId } = req.params;

    const [steps] = await pool.execute(
      `SELECT 
        id, sales_order_id, step_number, step_name, step_type, status,
        assigned_employee_id, assigned_at, started_at, completed_at,
        rejected_reason, notes, documents, verification_data
      FROM sales_order_workflow_steps
      WHERE sales_order_id = ?
      ORDER BY step_number ASC`,
      [rootCardId]
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

    // Update workflow step with assignment using dual-aware method
    await RootCardStep.assignEmployee(step.sales_order_id, step.step_number, employeeId, connection);

    // Record assignment
    await connection.execute(
      `INSERT INTO sales_order_step_assignments 
      (workflow_step_id, employee_id, assigned_by, reason)
      VALUES (?, ?, ?, ?)`,
      [stepId, employeeId, userId || null, reason || null]
    );

    /* 
    // Create task in employee dashboard
    try {
      const RootCard = require('../../models/RootCard');
      const rootCard = await RootCard.findById(step.sales_order_id);
      
      await EmployeeTask.createAssignedTask(
        employeeId,
        {
          title: `${step.step_name}: ${rootCard?.project_name || rootCard?.title || 'Project'}`,
          description: `Complete: ${step.step_name} for Root Card ${rootCard?.po_number || '#' + step.sales_order_id}`,
          type: step.step_type,
          priority: rootCard?.priority || 'medium',
          dueDate: rootCard?.due_date,
          salesOrderId: step.sales_order_id,
          assignedBy: userId
        },
        connection
      );
    } catch (err) {
      console.error('Error creating employee task:', err.message);
    }
    */

    // Send notification
    const notificationData = {
      userId: employeeId,
      message: `You have been assigned to: ${step.step_name} for Root Card #${step.sales_order_id}`,
      type: 'task_assignment',
      relatedId: step.sales_order_id,
      relatedType: 'root_card',
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
        id, sales_order_id, step_number, step_name, step_type, status as old_status, 
        assigned_employee_id
      FROM sales_order_workflow_steps
      WHERE id = ?`,
      [stepId]
    );

    if (steps.length === 0) {
      return res.status(404).json({ message: 'Workflow step not found' });
    }

    const step = steps[0];

    // Block completion of material_requirement or start of production_plan 
    // if no ACTIVE BOM exists for the root card.
    const isMaterialRequestCompletion = status === 'completed' && step.step_type === 'material_requirement';
    const isProductionPlanStart = status === 'in_progress' && step.step_type === 'production_plan';

    if (isMaterialRequestCompletion || isProductionPlanStart) {
      const [boms] = await connection.execute(
        'SELECT id FROM bill_of_materials WHERE root_card_id = ? AND status = "active"',
        [step.sales_order_id]
      );
      if (boms.length === 0) {
        return res.status(400).json({ 
          message: `Cannot ${isMaterialRequestCompletion ? 'complete Material Requirements' : 'start Production Planning'} step: No ACTIVE BOM found for this root card.`,
          requiresBOM: true 
        });
      }
    }

    await connection.query('START TRANSACTION');

    // Update status using dual-aware method
    await RootCardStep.updateStatus(step.sales_order_id, step.step_number, status, {
      verificationData,
      rejectionReason,
      notes
    }, connection);

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
          relatedType: 'root_card',
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
          SET workflow_status = 'completed', current_step = 8 WHERE id = ?`,
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

    // Get current documents and step details
    const [steps] = await pool.execute(
      'SELECT documents, sales_order_id, step_number FROM sales_order_workflow_steps WHERE id = ?',
      [stepId]
    );

    if (steps.length === 0) {
      return res.status(404).json({ message: 'Workflow step not found' });
    }

    const { sales_order_id, step_number } = steps[0];
    let currentDocs = [];
    try {
      currentDocs = JSON.parse(steps[0].documents || '[]');
    } catch (err) {
      currentDocs = [];
    }

    // Add new files - convert absolute paths to relative paths
    const nodePath = require('path');
    const newDocs = files.map((file) => {
      const relativePath = nodePath.relative(nodePath.join(__dirname, '../../'), file.path)
        .replace(/\\/g, '/');
      return {
        name: file.originalname,
        path: relativePath,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
    });

    const allDocs = [...currentDocs, ...newDocs];

    // Save documents to workflow table
    await pool.execute(
      'UPDATE sales_order_workflow_steps SET documents = ? WHERE id = ?',
      [JSON.stringify(allDocs), stepId]
    );

    // SYNCHRONIZATION: Handle specialized table synchronization
    if (step_number === 1) {
      // Step 1: Client PO
      try {
        const ClientPODetail = require('../../models/ClientPODetail');
        let poDetail = await ClientPODetail.findByRootCardId(sales_order_id);
        
        if (!poDetail) {
          await ClientPODetail.create({
            rootCardId: sales_order_id,
            poNumber: `TEMP-${Date.now()}`,
            poDate: new Date().toISOString().split('T')[0],
            clientName: 'TBD',
            clientEmail: 'TBD',
            clientPhone: 'TBD',
            projectName: 'TBD',
            projectCode: 'TBD',
            attachments: newDocs
          });
        } else {
          const currentAttachments = Array.isArray(poDetail.attachments) ? poDetail.attachments : [];
          await ClientPODetail.update(sales_order_id, {
            ...poDetail,
            attachments: [...currentAttachments, ...newDocs]
          });
        }
        console.log(`[WorkflowController] Synchronized ${newDocs.length} documents to client_po_details for SO ${sales_order_id}`);
      } catch (syncError) {
        console.error('[WorkflowController] Sync to ClientPODetail failed:', syncError.message);
      }
    } else if (step_number === 2) {
      // Step 2: Design Engineering
      try {
        const DesignEngineeringDetail = require('../../models/DesignEngineeringDetail');
        let designDetail = await DesignEngineeringDetail.findByRootCardId(sales_order_id);
        
        // If it doesn't exist, create a basic one
        if (!designDetail) {
          await DesignEngineeringDetail.create({
            rootCardId: sales_order_id,
            documents: newDocs,
            designStatus: 'draft'
          });
        } else {
          // Add each new document
          for (const doc of newDocs) {
            await DesignEngineeringDetail.addDocument(sales_order_id, {
              ...doc,
              mimeType: files.find(f => f.originalname === doc.name)?.mimetype || 'application/octet-stream',
              uploadedBy: req.user?.id || req.user?.userId
            });
          }
        }
        console.log(`[WorkflowController] Synchronized ${newDocs.length} documents to design_engineering_details for SO ${sales_order_id}`);
      } catch (syncError) {
        console.error('[WorkflowController] Sync to DesignEngineeringDetail failed:', syncError.message);
        // We don't fail the whole request because workflow update succeeded
      }
    }

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
    const { rootCardId } = req.params;

    // Get root card info
    const [rootCards] = await pool.execute(
      `SELECT id, po_number, customer, status, workflow_status, current_step,
        estimated_completion_date, created_at
      FROM sales_orders WHERE id = ?`,
      [rootCardId]
    );

    if (rootCards.length === 0) {
      return res.status(404).json({ message: 'Root Card not found' });
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
      [rootCardId]
    );

    // Enrich steps with employee and audit info
    const enrichedSteps = await Promise.all(
      steps.map(async (step) => {
        let assignedEmployee = null;

        if (step.assigned_employee_id) {
          const [employees] = await pool.execute(
            'SELECT id, first_name, last_name, email FROM employees WHERE id = ?',
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
      rootCard: rootCards[0],
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
        COUNT(DISTINCT sales_order_id) as total_root_cards,
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
