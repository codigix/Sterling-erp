const pool = require('../config/database');

const parseJson = (value, fallback = null) => {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
};

class ProductionPlan {
  static async addFinishedGoods(planId, items, externalConnection = null) {
    const connection = externalConnection || (await pool.getConnection());
    try {
      await connection.execute('DELETE FROM production_plan_fg WHERE production_plan_id = ?', [planId]);

      if (items && items.length > 0) {
        const values = items.map(item => [planId, item.itemId, item.quantity || 1, item.notes || null]);
        const flattenedValues = values.reduce((acc, val) => acc.concat(val), []);
        const placeholders = values.map(() => '(?, ?, ?, ?)').join(', ');

        await connection.execute(
          `INSERT INTO production_plan_fg (production_plan_id, item_id, quantity, notes) VALUES ${placeholders}`,
          flattenedValues
        );
      }

      if (!externalConnection) {
        connection.release();
      }
    } catch (error) {
      if (!externalConnection) {
        connection.release();
      }
      throw error;
    }
  }

  static async getFinishedGoods(planId) {
    const [rows] = await pool.execute(
      `
        SELECT ppfg.*, i.item_name, i.item_code, i.unit
        FROM production_plan_fg ppfg
        JOIN inventory i ON i.id = ppfg.item_id
        WHERE ppfg.production_plan_id = ?
      `,
      [planId]
    );
    return rows;
  }

  static async create(data, externalConnection = null) {
    const connection = externalConnection || (await pool.getConnection());

    try {
      const [result] = await connection.execute(
        `
          INSERT INTO production_plans
          (sales_order_id, root_card_id, bom_id, plan_name, status, planned_start_date, planned_end_date, 
           estimated_completion_date, supervisor_id, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.salesOrderId || null,
          data.rootCardId || null,
          data.bomId || null,
          data.planName,
          data.status || 'draft',
          data.plannedStartDate || null,
          data.plannedEndDate || null,
          data.estimatedCompletionDate || null,
          data.supervisorId || null,
          data.notes || null
        ]
      );

      if (!externalConnection) {
        connection.release();
      }

      return result.insertId;
    } catch (error) {
      if (!externalConnection) {
        connection.release();
      }
      throw error;
    }
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `
        SELECT pp.*, 
               so.customer AS customer_name,
               bom.sales_order_id,
               u.username AS supervisor_name,
               ppd.selected_phases
        FROM production_plans pp
        LEFT JOIN sales_orders so ON so.id = pp.sales_order_id
        LEFT JOIN bill_of_materials bom ON bom.id = pp.bom_id
        LEFT JOIN users u ON u.id = pp.supervisor_id
        LEFT JOIN production_plan_details ppd ON ppd.sales_order_id = pp.sales_order_id
        WHERE pp.id = ?
      `,
      [id]
    );
    
    if (rows[0]) {
      try {
        if (rows[0].selected_phases) {
          const selectedPhases = typeof rows[0].selected_phases === 'string' 
            ? JSON.parse(rows[0].selected_phases) 
            : rows[0].selected_phases;
          rows[0].phases = Object.keys(selectedPhases || {}).map(phaseName => ({
            stage_name: phaseName,
            stage_type: 'production'
          }));
        } else {
          rows[0].phases = [];
        }
      } catch (parseError) {
        console.warn(`Could not parse selected_phases for plan ${id}:`, parseError.message);
        rows[0].phases = [];
      }
      delete rows[0].selected_phases;
    }
    
    return rows[0];
  }

  static async findBySalesOrderId(salesOrderId) {
    const [rows] = await pool.execute(
      `
        SELECT pp.*, 
               so.customer AS customer_name,
               u.username AS supervisor_name,
               ppd.selected_phases
        FROM production_plans pp
        LEFT JOIN sales_orders so ON so.id = pp.sales_order_id
        LEFT JOIN users u ON u.id = pp.supervisor_id
        LEFT JOIN production_plan_details ppd ON ppd.sales_order_id = pp.sales_order_id
        WHERE pp.sales_order_id = ?
      `,
      [salesOrderId]
    );
    
    if (rows[0]) {
      try {
        if (rows[0].selected_phases) {
          const selectedPhases = typeof rows[0].selected_phases === 'string' 
            ? JSON.parse(rows[0].selected_phases) 
            : rows[0].selected_phases;
          rows[0].phases = Object.keys(selectedPhases || {}).map(phaseName => ({
            stage_name: phaseName,
            stage_type: 'production'
          }));
        } else {
          rows[0].phases = [];
        }
      } catch (parseError) {
        console.warn(`Could not parse selected_phases for sales order ${salesOrderId}:`, parseError.message);
        rows[0].phases = [];
      }
      delete rows[0].selected_phases;
    }
    
    return rows[0];
  }

  static async findAll(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.status && filters.status !== 'all') {
      conditions.push('pp.status = ?');
      params.push(filters.status);
    }

    if (filters.search) {
      conditions.push('(pp.plan_name LIKE ? OR so.customer LIKE ?)');
      const like = `%${filters.search}%`;
      params.push(like, like);
    }

    let query = `
      SELECT pp.*, 
             so.customer AS customer_name,
             u.username AS supervisor_name,
             ppd.selected_phases
      FROM production_plans pp
      LEFT JOIN sales_orders so ON so.id = pp.sales_order_id
      LEFT JOIN users u ON u.id = pp.supervisor_id
      LEFT JOIN production_plan_details ppd ON ppd.sales_order_id = pp.sales_order_id
    `;

    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY pp.created_at DESC';

    const [rows] = await pool.execute(query, params);
    
    const plansWithPhases = [];
    for (const plan of rows || []) {
      try {
        if (plan.selected_phases) {
          const selectedPhases = typeof plan.selected_phases === 'string' 
            ? JSON.parse(plan.selected_phases) 
            : plan.selected_phases;
          plan.phases = Object.keys(selectedPhases || {}).map(phaseName => ({
            stage_name: phaseName,
            stage_type: 'production'
          }));
        } else {
          plan.phases = [];
        }
      } catch (parseError) {
        console.warn(`Could not parse selected_phases for plan ${plan.id}:`, parseError.message);
        plan.phases = [];
      }
      
      delete plan.selected_phases;
      plansWithPhases.push(plan);
    }
    
    return plansWithPhases;
  }

  static async updateStatus(id, status) {
    await pool.execute(
      'UPDATE production_plans SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
  }

  static async update(id, data) {
    await pool.execute(
      `
        UPDATE production_plans
        SET plan_name = ?, status = ?, root_card_id = ?, planned_start_date = ?, planned_end_date = ?, 
            estimated_completion_date = ?, supervisor_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [
        data.planName,
        data.status,
        data.rootCardId || null,
        data.plannedStartDate || null,
        data.plannedEndDate || null,
        data.estimatedCompletionDate || null,
        data.supervisorId || null,
        data.notes || null,
        id
      ]
    );
  }

  static async updateStageCounts(id, totalStages, completedStages) {
    await pool.execute(
      'UPDATE production_plans SET total_stages = ?, completed_stages = ? WHERE id = ?',
      [totalStages, completedStages, id]
    );
  }

  static async getStats() {
    const [rows] = await pool.execute(`
      SELECT
        COUNT(*) AS total_plans,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft_plans,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_plans,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_plans,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_plans
      FROM production_plans
    `);
    return rows[0];
  }

  static async addStages(planId, stages, externalConnection = null) {
    const connection = externalConnection || (await pool.getConnection());
    
    try {
      if (!stages || stages.length === 0) {
        if (!externalConnection) connection.release();
        return;
      }

      const toSafeId = (val) => {
        if (val === null || val === undefined || val === '' || val === 0 || val === '0') {
          return null;
        }
        const num = parseInt(val);
        return (num && num > 0 && !isNaN(num)) ? num : null;
      };

      const values = [];
      
      for (let idx = 0; idx < stages.length; idx++) {
        const stage = stages[idx];
        let employeeId = toSafeId(stage.assignedEmployeeId);
        let facilityId = toSafeId(stage.assignedFacilityId);
        const vendorId = toSafeId(stage.assignedVendorId);
        
        // Calculate duration from start and end dates
        let durationDays = null;
        if (stage.plannedStartDate && stage.plannedEndDate) {
          const startDate = new Date(stage.plannedStartDate);
          const endDate = new Date(stage.plannedEndDate);
          const timeDiff = endDate - startDate;
          durationDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          console.log(`[ProductionPlan.addStages] Calculated duration: ${durationDays} days (${stage.plannedStartDate} to ${stage.plannedEndDate})`);
        }
        
        // Validate that employee exists if provided
        if (employeeId) {
          const [empCheck] = await connection.execute('SELECT id FROM employees WHERE id = ? AND status = "active"', [employeeId]);
          if (empCheck.length === 0) {
            console.log(`[ProductionPlan.addStages] Employee ID ${employeeId} does not exist or is inactive, setting to NULL`);
            employeeId = null;
          } else {
            console.log(`[ProductionPlan.addStages] ✓ Employee ID ${employeeId} validated successfully`);
          }
        }
        
        // Validate that facility exists if provided
        if (facilityId) {
          const [facCheck] = await connection.execute('SELECT id FROM manufacturing_facilities WHERE id = ?', [facilityId]);
          if (facCheck.length === 0) {
            console.log(`[ProductionPlan.addStages] Facility ID ${facilityId} does not exist, setting to NULL`);
            facilityId = null;
          }
        }
        
        values.push([
          planId,
          stage.stageName,
          idx + 1,
          stage.stageType || 'in_house',
          durationDays,
          stage.estimatedDelayDays || null,
          stage.plannedStartDate || null,
          stage.plannedEndDate || null,
          employeeId,
          facilityId,
          vendorId,
          stage.notes || null
        ]);
      }

      console.log('[ProductionPlan.addStages] Inserting stages with values:', JSON.stringify(values, null, 2));

      const flattenedValues = values.reduce((acc, val) => acc.concat(val), []);
      const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');

      const query = `INSERT INTO production_plan_stages 
         (production_plan_id, stage_name, sequence, stage_type, duration_days, estimated_delay_days, 
          planned_start_date, planned_end_date, assigned_employee_id, assigned_facility_id, assigned_vendor_id, notes)
         VALUES ${placeholders}`;
      
      console.log('[ProductionPlan.addStages] Query:', query);
      console.log('[ProductionPlan.addStages] Values:', flattenedValues);

      await connection.execute(query, flattenedValues);

      if (!externalConnection) {
        connection.release();
      }
    } catch (error) {
      if (!externalConnection) {
        connection.release();
      }
      console.error('[ProductionPlan.addStages] Error:', error);
      throw error;
    }
  }

  static async delete(id) {
    await pool.execute(
      'DELETE FROM production_plans WHERE id = ?',
      [id]
    );
  }
}

module.exports = ProductionPlan;
