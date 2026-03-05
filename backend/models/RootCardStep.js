const pool = require('../config/database');
const { parseJsonField, stringifyJsonField } = require('../utils/rootCardHelpers');

class RootCardStep {
  static STEP_TYPES = {
    PO_DETAILS: 'po_details',
    DESIGN_ENGINEERING: 'design_engineering',
    MATERIAL_REQUIREMENT: 'material_requirement',
    PRODUCTION_PLAN: 'production_plan',
    QUALITY_CHECK: 'quality_check',
    SHIPMENT: 'shipment',
    DELIVERY: 'delivery'
  };

  static STEP_DEFINITIONS = [
    { id: 1, key: 'po_details', name: 'PO Details' },
    { id: 2, key: 'design_engineering', name: 'Design Engineering' },
    { id: 3, key: 'material_requirement', name: 'Material Requirements' },
    { id: 4, key: 'production_plan', name: 'Production Plan' },
    { id: 5, key: 'quality_check', name: 'Quality Check' },
    { id: 6, key: 'shipment', name: 'Shipment' },
    { id: 7, key: 'delivery', name: 'Delivery' }
  ];

  static async createTable() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sales_order_steps (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL,
        step_id INT NOT NULL,
        step_key VARCHAR(50) NOT NULL,
        step_name VARCHAR(100) NOT NULL,
        status ENUM('pending', 'in_progress', 'completed', 'on_hold', 'approved', 'rejected') DEFAULT 'pending',
        data JSON,
        assigned_to INT,
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id),
        UNIQUE KEY unique_so_step (sales_order_id, step_id),
        INDEX idx_so_step_status (sales_order_id, status),
        INDEX idx_step_key (step_key)
      )
    `);
  }

  static async findByIdAndStep(rootCardId, stepId) {
    const [rows] = await pool.execute(
      `SELECT * FROM sales_order_steps WHERE sales_order_id = ? AND step_id = ?`,
      [rootCardId, stepId]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async findBySalesOrderId(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT * FROM sales_order_steps WHERE sales_order_id = ? ORDER BY step_id ASC`,
      [salesOrderId]
    );
    return rows.map(this.formatRow);
  }

  static async findByRootCardId(rootCardId) {
    return this.findBySalesOrderId(rootCardId);
  }

  static async findByStepKey(rootCardId, stepKey) {
    const [rows] = await pool.execute(
      `SELECT * FROM sales_order_steps WHERE sales_order_id = ? AND step_key = ?`,
      [rootCardId, stepKey]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO sales_order_steps 
       (sales_order_id, step_id, step_key, step_name, status, data, assigned_to, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.rootCardId,
        data.stepId,
        data.stepKey,
        data.stepName,
        data.status || 'pending',
        stringifyJsonField(data.data),
        data.assignedTo || null,
        data.notes || null
      ]
    );
    return result.insertId;
  }

  static async update(rootCardId, stepId, data, connection = null) {
    const conn = connection || pool;
    console.log(`[RootCardStep] Updating step ${stepId} for rootCard ${rootCardId}`, {
      status: data.status,
      hasData: !!data.data,
      assignedTo: data.assignedTo
    });
    
    try {
      let finalAssignedTo = null;
      if (data.assignedTo && !isNaN(parseInt(data.assignedTo))) {
        finalAssignedTo = parseInt(data.assignedTo);
      } else if (typeof data.assignedTo === 'string' && data.assignedTo.trim() !== '') {
        // Resolve loginId to numeric ID
        const [rows] = await pool.execute('SELECT id FROM users WHERE loginId = ?', [data.assignedTo]);
        if (rows.length > 0) {
          finalAssignedTo = rows[0].id;
        }
      }

      // Update legacy table
      console.log('  [RootCardStep] Updating sales_order_steps...');
      const [legacyResult] = await conn.execute(
        `UPDATE sales_order_steps 
         SET status = ?, data = ?, assigned_to = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE sales_order_id = ? AND step_id = ?`,
        [
          data.status,
          stringifyJsonField(data.data),
          finalAssignedTo,
          data.notes || null,
          rootCardId,
          stepId
        ]
      );
      console.log(`  [RootCardStep] Legacy update successful: ${legacyResult.affectedRows} rows`);

      // Update new workflow table
      console.log('  [RootCardStep] Updating sales_order_workflow_steps...');
      const [workflowResult] = await conn.execute(
        `UPDATE sales_order_workflow_steps 
         SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE sales_order_id = ? AND step_number = ?`,
        [
          data.status,
          data.notes || null,
          rootCardId,
          stepId
        ]
      );
      console.log(`  [RootCardStep] Workflow update successful: ${workflowResult.affectedRows} rows`);
    } catch (error) {
      console.error('  [RootCardStep] FATAL ERROR in update:', error);
      throw error;
    }
  }

  static async updateStatus(rootCardId, stepId, status, extraData = {}, connection = null) {
    const conn = connection || pool;
    const completedAtValue = status === 'completed' ? new Date() : null;
    
    // Update legacy table
    let legacyUpdate = 'UPDATE sales_order_steps SET status = ?, updated_at = CURRENT_TIMESTAMP';
    const legacyParams = [status];
    
    if (status === 'completed') {
      legacyUpdate += ', completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP)';
    }
    
    if (extraData.notes) {
      legacyUpdate += ', notes = ?';
      legacyParams.push(extraData.notes);
    }
    
    legacyUpdate += ' WHERE sales_order_id = ? AND step_id = ?';
    legacyParams.push(rootCardId, stepId);
    
    await conn.execute(legacyUpdate, legacyParams);

    // Update new workflow table
    let workflowUpdate = 'UPDATE sales_order_workflow_steps SET status = ?, updated_at = CURRENT_TIMESTAMP';
    const workflowParams = [status];
    
    if (status === 'completed') {
      workflowUpdate += ', completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP)';
    } else if (status === 'in_progress') {
      workflowUpdate += ', started_at = COALESCE(started_at, CURRENT_TIMESTAMP)';
    }
    
    if (extraData.verificationData) {
      workflowUpdate += ', verification_data = ?';
      workflowParams.push(JSON.stringify(extraData.verificationData));
    }
    
    if (extraData.rejectionReason) {
      workflowUpdate += ', rejected_reason = ?';
      workflowParams.push(extraData.rejectionReason);
    }
    
    if (extraData.notes) {
      workflowUpdate += ', notes = ?';
      workflowParams.push(extraData.notes);
    }
    
    workflowUpdate += ' WHERE sales_order_id = ? AND step_number = ?';
    workflowParams.push(rootCardId, stepId);
    
    await conn.execute(workflowUpdate, workflowParams);
  }

  static async startStep(rootCardId, stepId, connection = null) {
    const conn = connection || pool;
    // Update legacy table
    await conn.execute(
      `UPDATE sales_order_steps 
       SET status = 'in_progress', started_at = COALESCE(started_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ? AND step_id = ?`,
      [rootCardId, stepId]
    );

    // Update new workflow table
    await conn.execute(
      `UPDATE sales_order_workflow_steps 
       SET status = 'in_progress', started_at = COALESCE(started_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ? AND step_number = ?`,
      [rootCardId, stepId]
    );
  }

  static async completeStep(rootCardId, stepId, connection = null) {
    const conn = connection || pool;
    // Update legacy table
    await conn.execute(
      `UPDATE sales_order_steps 
       SET status = 'completed', completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ? AND step_id = ?`,
      [rootCardId, stepId]
    );

    // Update new workflow table
    await conn.execute(
      `UPDATE sales_order_workflow_steps 
       SET status = 'completed', completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ? AND step_number = ?`,
      [rootCardId, stepId]
    );
  }

  static async assignEmployee(rootCardId, stepId, employeeId, connection = null) {
    const conn = connection || pool;
    console.log(`[RootCardStep] Assigning employee ${employeeId} to step ${stepId} for rootCard ${rootCardId}`);

    let finalEmployeeId = null;
    if (employeeId && !isNaN(parseInt(employeeId))) {
      finalEmployeeId = parseInt(employeeId);
    } else if (typeof employeeId === 'string' && employeeId.trim() !== '') {
      // If it's a loginId string (like 'inventory.manager'), try to resolve it to an ID
      console.log(`  [RootCardStep] Resolving string employeeId: ${employeeId}`);
      try {
        const [rows] = await pool.execute('SELECT id FROM users WHERE loginId = ?', [employeeId]);
        if (rows.length > 0) {
          finalEmployeeId = rows[0].id;
          console.log(`  [RootCardStep] Resolved ${employeeId} to ID ${finalEmployeeId}`);
        } else {
          console.warn(`  [RootCardStep] Could not resolve loginId: ${employeeId}. Setting to null.`);
        }
      } catch (err) {
        console.error(`  [RootCardStep] Error resolving employeeId:`, err);
      }
    }

    try {
      // Update legacy table
      console.log('  [RootCardStep] Updating sales_order_steps assignee...');
      await conn.execute(
        `UPDATE sales_order_steps 
         SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP
         WHERE sales_order_id = ? AND step_id = ?`,
        [finalEmployeeId, rootCardId, stepId]
      );

      // Update new workflow table
      console.log('  [RootCardStep] Updating sales_order_workflow_steps assignee...');
      await conn.execute(
        `UPDATE sales_order_workflow_steps 
         SET assigned_employee_id = ?, assigned_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE sales_order_id = ? AND step_number = ?`,
        [finalEmployeeId, rootCardId, stepId]
      );
      console.log('  [RootCardStep] Assignment successful');
    } catch (error) {
      console.error('  [RootCardStep] FATAL ERROR in assignEmployee:', error);
      throw error;
    }
  }

  static async getStepProgress(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT step_id, status FROM sales_order_steps WHERE sales_order_id = ? ORDER BY step_id ASC`,
      [rootCardId]
    );
    
    const totalSteps = rows.length;
    const completedSteps = rows.filter(r => r.status === 'completed').length;
    const inProgressSteps = rows.filter(r => r.status === 'in_progress').length;

    return {
      totalSteps,
      completedSteps,
      inProgressSteps,
      remainingSteps: totalSteps - completedSteps,
      progressPercentage: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
      steps: rows
    };
  }

  static async getCompletedSteps(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT step_id, step_name FROM sales_order_steps 
       WHERE sales_order_id = ? AND status = 'completed' ORDER BY completed_at ASC`,
      [rootCardId]
    );
    return rows;
  }

  static async getPendingSteps(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT * FROM sales_order_steps 
       WHERE sales_order_id = ? AND status = 'pending' ORDER BY step_id ASC`,
      [rootCardId]
    );
    return rows.map(this.formatRow);
  }

  static formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      rootCardId: row.sales_order_id,
      stepId: row.step_id,
      stepKey: row.step_key,
      stepName: row.step_name,
      status: row.status,
      data: parseJsonField(row.data),
      assignedTo: row.assigned_to,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static async initializeAllSteps(rootCardId, connection = null) {
    const conn = connection || pool;
    const stepDefinitions = [
      { stepId: 1, stepKey: 'po_details', stepName: 'PO Details' },
      { stepId: 2, stepKey: 'design_engineering', stepName: 'Design Engineering' },
      { stepId: 3, stepKey: 'material_requirement', stepName: 'Material Requirements' },
      { stepId: 4, stepKey: 'production_plan', stepName: 'Production Plan' },
      { stepId: 5, stepKey: 'quality_check', stepName: 'Quality Check' },
      { stepId: 6, stepKey: 'shipment', stepName: 'Shipment' },
      { stepId: 7, stepKey: 'delivery', stepName: 'Delivery' }
    ];

    for (const step of stepDefinitions) {
      // Initialize old system table
      await conn.execute(
        `INSERT IGNORE INTO sales_order_steps 
         (sales_order_id, step_id, step_key, step_name, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [rootCardId, step.stepId, step.stepKey, step.stepName]
      );

      // Initialize new workflow system table
      await conn.execute(
        `INSERT IGNORE INTO sales_order_workflow_steps 
         (sales_order_id, step_number, step_name, step_type, status)
         VALUES (?, ?, ?, ?, 'pending')`,
        [rootCardId, step.stepId, step.stepName, step.stepKey]
      );
    }

    // Update root card status to in_progress
    await conn.execute(
      'UPDATE sales_orders SET workflow_status = ?, current_step = 1 WHERE id = ?',
      ['in_progress', rootCardId]
    );
  }
}

module.exports = RootCardStep;
