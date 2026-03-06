const pool = require('../config/database');

class RootCardInventoryTask {
  static WORKFLOW_STEPS = [
    { step: 1, name: 'Check Project Material Requirements' },
    { step: 2, name: 'Create RFQ Quotation' },
    { step: 3, name: 'Send Quotation to Vendor' },
    { step: 4, name: 'Receive Vendor Quotation' },
    { step: 5, name: 'Create Purchase Order' },
    { step: 6, name: 'Send PO to Vendor' },
    { step: 7, name: 'Approve Purchase Order' },
    { step: 8, name: 'Receive Material' },
    { step: 9, name: 'GRN Processing' },
    { step: 10, name: 'QC Inspection' },
    { step: 11, name: 'Stock Addition' },
    { step: 12, name: 'Release Material' }
  ];

  static async getRootCardInventoryTasks(rootCardId, withDetails = false) {
    const [tasks] = await pool.execute(
      `SELECT pit.*, u.username as completed_by_name, mr.mr_number, mr.purpose as mr_purpose
       FROM root_card_inventory_tasks pit
       LEFT JOIN users u ON u.id = pit.completed_by
       LEFT JOIN material_requests mr ON mr.id = pit.material_request_id
       WHERE pit.root_card_id = ?
       ORDER BY pit.created_at DESC, pit.step_number ASC`,
      [rootCardId]
    );
    
    return withDetails ? tasks.map(task => ({
      ...task,
      stepName: RootCardInventoryTask.WORKFLOW_STEPS.find(s => s.step === task.step_number)?.name
    })) : tasks;
  }

  static async getTasksByMaterialRequestId(mrId, withDetails = false) {
    const [tasks] = await pool.execute(
      `SELECT pit.*, u.username as completed_by_name, mr.mr_number, mr.purpose as mr_purpose
       FROM root_card_inventory_tasks pit
       LEFT JOIN users u ON u.id = pit.completed_by
       LEFT JOIN material_requests mr ON mr.id = pit.material_request_id
       WHERE pit.material_request_id = ?
       ORDER BY pit.step_number ASC`,
      [mrId]
    );
    
    return withDetails ? tasks.map(task => ({
      ...task,
      stepName: RootCardInventoryTask.WORKFLOW_STEPS.find(s => s.step === task.step_number)?.name
    })) : tasks;
  }

  static async getTaskByRootCardAndStep(rootCardId, stepNumber) {
    const [tasks] = await pool.execute(
      `SELECT pit.*, u.username as completed_by_name
       FROM root_card_inventory_tasks pit
       LEFT JOIN users u ON u.id = pit.completed_by
       WHERE pit.root_card_id = ? AND pit.step_number = ?
       LIMIT 1`,
      [rootCardId, stepNumber]
    );
    
    return tasks.length > 0 ? tasks[0] : null;
  }

  static async getTaskById(taskId) {
    const [tasks] = await pool.execute(
      `SELECT pit.*, u.username as completed_by_name
       FROM root_card_inventory_tasks pit
       LEFT JOIN users u ON u.id = pit.completed_by
       WHERE pit.id = ?
       LIMIT 1`,
      [taskId]
    );
    
    return tasks.length > 0 ? tasks[0] : null;
  }

  static async initializeRootCardTasks(rootCardId, productionRootCardId = null, externalConnection = null, materialRequestId = null) {
    console.log(`[RootCardInventoryTask] Initializing tasks for rootCard ${rootCardId}, productionRootCard ${productionRootCardId}, MR ${materialRequestId}`);
    const conn = externalConnection || (await pool.getConnection());
    const createdTasks = [];
    const shouldRelease = !externalConnection;
    
    try {
      for (const step of RootCardInventoryTask.WORKFLOW_STEPS) {
        // Use material_request_id as the primary lookup if available
        let query;
        let queryParams;

        if (materialRequestId) {
          query = `SELECT id FROM root_card_inventory_tasks WHERE material_request_id = ? AND step_number = ? LIMIT 1`;
          queryParams = [materialRequestId, step.step];
        } else {
          query = `SELECT id FROM root_card_inventory_tasks WHERE root_card_id = ? AND step_number = ? AND material_request_id IS NULL LIMIT 1`;
          queryParams = [rootCardId, step.step];
        }

        const [existingTasks] = await conn.execute(query, queryParams);
        
        if (existingTasks.length === 0) {
          const [result] = await conn.execute(
            `INSERT INTO root_card_inventory_tasks 
             (root_card_id, production_root_card_id, material_request_id, step_number, step_name, status)
             VALUES (?, ?, ?, ?, ?, 'pending')`,
            [rootCardId || null, productionRootCardId, materialRequestId || null, step.step, step.name]
          );
          
          console.log(`[RootCardInventoryTask] Created task: step ${step.step} (${step.name}), taskId=${result.insertId}`);
          
          createdTasks.push({
            id: result.insertId,
            rootCardId,
            stepNumber: step.step,
            stepName: step.name,
            status: 'pending'
          });
        }
      }
      
      console.log(`[RootCardInventoryTask] Initialization complete: ${createdTasks.length} tasks created`);
      return {
        success: true,
        tasksCreated: createdTasks.length,
        tasks: createdTasks
      };
    } catch (error) {
      console.error(`[RootCardInventoryTask] Error initializing tasks:`, error);
      throw error;
    } finally {
      if (shouldRelease) {
        await conn.release();
      }
    }
  }

  static async updateTaskStatus(taskId, status, completedBy = null) {
    const completedAt = status === 'completed' ? new Date() : null;
    
    const [result] = await pool.execute(
      `UPDATE root_card_inventory_tasks 
       SET status = ?, completed_by = ?, completed_at = ?
       WHERE id = ?`,
      [status, completedBy, completedAt, taskId]
    );
    
    return result;
  }

  static async updateTaskWithReference(taskId, referenceId, referenceType, status = 'in_progress') {
    const [result] = await pool.execute(
      `UPDATE root_card_inventory_tasks 
       SET reference_id = ?, reference_type = ?, status = ?
       WHERE id = ?`,
      [referenceId, referenceType, status, taskId]
    );
    
    return result;
  }

  static async getRootCardWorkflowProgress(rootCardId) {
    const tasks = await RootCardInventoryTask.getRootCardInventoryTasks(rootCardId);
    
    const progress = {
      rootCardId,
      totalSteps: RootCardInventoryTask.WORKFLOW_STEPS.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      completionPercentage: Math.round((tasks.filter(t => t.status === 'completed').length / RootCardInventoryTask.WORKFLOW_STEPS.length) * 100),
      steps: tasks.map(task => ({
        id: task.id,
        stepNumber: task.step_number,
        stepName: task.step_name,
        status: task.status,
        referenceId: task.reference_id,
        referenceType: task.reference_type,
        completedBy: task.completed_by_name,
        completedAt: task.completed_at
      }))
    };
    
    return progress;
  }

  static async getMRWorkflowProgress(mrId) {
    const tasks = await RootCardInventoryTask.getTasksByMaterialRequestId(mrId);
    
    const progress = {
      mrId,
      totalSteps: RootCardInventoryTask.WORKFLOW_STEPS.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      completionPercentage: Math.round((tasks.filter(t => t.status === 'completed').length / RootCardInventoryTask.WORKFLOW_STEPS.length) * 100),
      steps: tasks.map(task => ({
        id: task.id,
        stepNumber: task.step_number,
        stepName: task.step_name,
        status: task.status,
        referenceId: task.reference_id,
        referenceType: task.reference_type,
        completedBy: task.completed_by_name,
        completedAt: task.completed_at
      }))
    };
    
    return progress;
  }

  static async completeTask(taskId, completedBy) {
    const [result] = await pool.execute(
      `UPDATE root_card_inventory_tasks 
       SET status = 'completed', completed_by = ?, completed_at = NOW()
       WHERE id = ?`,
      [completedBy, taskId]
    );
    
    return result;
  }

  static async syncMRWorkflow(mrId) {
    try {
      const [mrRows] = await pool.execute('SELECT id, sales_order_id, status FROM material_requests WHERE id = ?', [mrId]);
      if (!mrRows.length) return;
      const mr = mrRows[0];

      // 1. Check for Quotations
      const [quotes] = await pool.execute('SELECT id, type, status FROM quotations WHERE material_request_id = ?', [mrId]);
      
      if (quotes.length > 0) {
        const outbound = quotes.find(q => q.type === 'outbound');
        const inbound = quotes.find(q => q.type === 'inbound');
        
        if (outbound) {
          // Step 2: Create RFQ Quotation
          await this.completeTaskByMRAndStep(mrId, 2, null);
          
          if (outbound.status === 'sent' || outbound.status === 'responded' || outbound.status === 'approved') {
            // Step 3: Send Quotation to Vendor
            await this.completeTaskByMRAndStep(mrId, 3, null);
          }
        }
        
        if (inbound) {
          // Step 4: Receive Vendor Quotation
          await this.completeTaskByMRAndStep(mrId, 4, null);
        }
      }

      // 2. Check for Purchase Orders
      const [pos] = await pool.execute('SELECT id, status, po_number FROM purchase_orders WHERE material_request_id = ?', [mrId]);
      
      if (pos.length > 0) {
        // Step 5: Create Purchase Order is definitely done if a PO exists
        await this.completeTaskByMRAndStep(mrId, 5, null);
        
        // Check for approvals and emails
        for (const po of pos) {
          // If PO is approved, complete Step 7
          if (po.status === 'approved' || po.status === 'goods arrival' || po.status === 'fulfilled') {
            await this.completeTaskByMRAndStep(mrId, 7, null);
            
            // AUTO-LINK: Ensure Step 7 and 8 are linked to this PO for navigation
            const tasks = await this.getTasksByMaterialRequestId(mrId);
            const step7Task = tasks.find(t => t.step_number === 7 || t.step_name === 'Approve Purchase Order');
            const step8Task = tasks.find(t => t.step_number === 8 || t.step_name === 'Receive Material');
            
            if (step7Task && (!step7Task.reference_id || step7Task.reference_id != po.id)) {
              await this.updateTaskWithReference(step7Task.id, po.id, 'purchase_order', step7Task.status);
            }
            if (step8Task && (!step8Task.reference_id || step8Task.reference_id != po.id)) {
              await this.updateTaskWithReference(step8Task.id, po.id, 'purchase_order', step8Task.status);
            }
          }
          
          // Check if Step 6 (Send PO) is done by looking at communications
          const [comms] = await pool.execute('SELECT id FROM purchase_order_communications WHERE po_id = ? LIMIT 1', [po.id]);
          if (comms.length > 0) {
            await this.completeTaskByMRAndStep(mrId, 6, null);
          }
        }
      }

      // 2. Check for GRNs
      const [grns] = await pool.execute(`
        SELECT g.id, g.qc_status, g.inspection_status 
        FROM grn g
        JOIN purchase_orders po ON g.po_id = po.id
        WHERE po.material_request_id = ?
      `, [mrId]);

      if (grns.length > 0) {
        // Step 8: Receive Material is done if a GRN exists
        await this.completeTaskByMRAndStep(mrId, 8, null);
        
        for (const grn of grns) {
          // Step 9: GRN Processing is completed only if it's approved (status is not 'pending_approval')
          if (grn.qc_status !== 'pending_approval') {
            await this.completeTaskByMRAndStep(mrId, 9, null);
          } else {
            // Set Step 9 to in_progress if it's currently pending
            const tasks = await this.getTasksByMaterialRequestId(mrId);
            const step9Task = tasks.find(t => t.step_number === 9 || t.step_name === 'GRN Processing');
            if (step9Task && step9Task.status === 'pending') {
              await this.updateTaskStatus(step9Task.id, 'in_progress', null);
            }
          }

          // Step 10: QC Inspection
          if (grn.qc_status === 'passed' || grn.qc_status === 'approved' || grn.inspection_status === 'passed') {
            await this.completeTaskByMRAndStep(mrId, 10, null);
          }
          
          // Step 11: Stock Addition
          // Check if stock entries exist for this GRN
          const [stockEntries] = await pool.execute('SELECT id FROM stock_entries WHERE grn_id = ? LIMIT 1', [grn.id]);
          if (stockEntries.length > 0) {
            await this.completeTaskByMRAndStep(mrId, 11, null);
          }
        }
      }

      // 3. Check for Material Request status (Step 12: Release Material)
      if (mr.status === 'completed' || mr.status === 'received') {
        await this.completeTaskByMRAndStep(mrId, 12, null);
      }
    } catch (error) {
      console.error(`[RootCardInventoryTask] Sync error for MR ${mrId}:`, error);
    }
  }

  static async completeTaskByMRAndStep(mrId, stepNumber, completedBy, externalConnection = null) {
    const conn = externalConnection || pool;
    
    // Ensure mrId and stepNumber are integers
    const id = parseInt(mrId);
    const stepNum = parseInt(stepNumber);
    
    if (isNaN(id) || isNaN(stepNum)) {
      console.warn(`[RootCardInventoryTask] Invalid mrId (${mrId}) or stepNumber (${stepNumber}) for completeTaskByMRAndStep`);
      return { affectedRows: 0 };
    }

    // Find the step name from our current definition
    const stepDef = RootCardInventoryTask.WORKFLOW_STEPS.find(s => s.step === stepNum);
    const stepName = stepDef?.name;

    let query = `UPDATE root_card_inventory_tasks 
                 SET status = 'completed', completed_by = ?, completed_at = NOW()
                 WHERE material_request_id = ? AND (step_number = ?`;
    let params = [completedBy, id, stepNum];

    if (stepName) {
      query += ` OR step_name = ?`;
      params.push(stepName);
    }
    
    query += `)`;
    
    const [result] = await conn.execute(query, params);
    
    // If we updated based on name, let's also sync the step_number to the current definition
    if (result.affectedRows > 0 && stepName) {
      await conn.execute(
        `UPDATE root_card_inventory_tasks SET step_number = ? WHERE material_request_id = ? AND step_name = ?`,
        [stepNum, id, stepName]
      ).catch(err => console.warn('Failed to sync step_number:', err.message));
    }

    return result;
  }

  static async setTaskInProgress(taskId, completedBy = null) {
    const [result] = await pool.execute(
      `UPDATE root_card_inventory_tasks 
       SET status = 'in_progress', completed_by = ?
       WHERE id = ?`,
      [completedBy, taskId]
    );
    
    return result;
  }
}

module.exports = RootCardInventoryTask;
