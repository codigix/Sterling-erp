const pool = require('../config/database');

const parseJson = (value, fallback = null) => {
  if (!value) {
    return fallback;
  }
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (_error) {
    return fallback;
  }
};

const ensureArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      return [];
    }
  }
  return [value];
};

class ProductionPlan {
  static async addFinishedGoods(planId, items, externalConnection = null) {
    const connection = externalConnection || (await pool.getConnection());
    try {
      await connection.execute('DELETE FROM production_plan_fg WHERE production_plan_id = ?', [planId]);

      if (items && items.length > 0) {
        const values = [];
        
        for (const item of items) {
          let itemId = item.itemId || item.id;
          
          // If no numeric ID provided, try to find by itemCode
          if (!itemId && item.itemCode) {
            const [itemRows] = await connection.execute(
              'SELECT id FROM inventory WHERE item_code = ? LIMIT 1',
              [item.itemCode]
            );
            if (itemRows.length > 0) {
              itemId = itemRows[0].id;
            }
          }
          
          if (itemId) {
            values.push([
              planId, 
              itemId, 
              item.quantity || item.plannedQty || 1, 
              item.notes || null
            ]);
          } else {
            console.warn(`[ProductionPlan.addFinishedGoods] Skipping item without ID: ${item.itemCode || 'Unknown'}`);
          }
        }

        if (values.length > 0) {
          const flattenedValues = values.reduce((acc, val) => acc.concat(val), []);
          const placeholders = values.map(() => '(?, ?, ?, ?)').join(', ');

          await connection.execute(
            `INSERT INTO production_plan_fg (production_plan_id, item_id, quantity, notes) VALUES ${placeholders}`,
            flattenedValues
          );
        }
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
          (sales_order_id, root_card_id, bom_id, target_quantity, plan_name, status, planned_start_date, planned_end_date, 
           estimated_completion_date, supervisor_id, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.salesOrderId || null,
          data.rootCardId || null,
          data.bomId || null,
          data.targetQuantity || 1,
          data.planName || null,
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
    const isPlanName = typeof id === 'string' && id.startsWith('PP-');
    const [rows] = await pool.execute(
      `
        SELECT pp.*, 
               DATE_FORMAT(pp.planned_start_date, '%Y-%m-%d') as planned_start_date,
               DATE_FORMAT(pp.planned_end_date, '%Y-%m-%d') as planned_end_date,
               DATE_FORMAT(pp.estimated_completion_date, '%Y-%m-%d') as estimated_completion_date,
               p.id as project_id,
               COALESCE(so.customer, som.customer_name) AS customer_name,
               u.username AS supervisor_name,
               ppd.id AS detail_id,
               ppd.selected_phases,
               ppd.available_phases,
               ppd.finished_goods,
               ppd.sub_assemblies,
               ppd.materials,
               sod.product_details,
               bom.product_name as bom_product_name,
               bom.item_code as bom_item_code,
               p.name as project_name
        FROM production_plans pp
        LEFT JOIN root_cards rc ON rc.id = pp.root_card_id
        LEFT JOIN sales_orders so ON so.id = pp.sales_order_id
        LEFT JOIN sales_orders_management som ON som.id = pp.sales_order_id
        LEFT JOIN projects p ON (p.sales_order_id = pp.sales_order_id OR p.id = rc.project_id)
        LEFT JOIN bill_of_materials bom ON (bom.id = pp.bom_id OR bom.id = som.bom_id)
        LEFT JOIN users u ON u.id = pp.supervisor_id
        LEFT JOIN production_plan_details ppd ON 
          (ppd.production_plan_id = pp.id) OR
          (ppd.production_plan_id IS NULL AND (
            (pp.sales_order_id IS NOT NULL AND ppd.sales_order_id = pp.sales_order_id) OR
            (pp.root_card_id IS NOT NULL AND ppd.root_card_id = pp.root_card_id)
          ))
        LEFT JOIN sales_order_details sod ON sod.sales_order_id = pp.sales_order_id
        WHERE ${isPlanName ? 'pp.plan_name = ?' : 'pp.id = ?'}
        ORDER BY (ppd.production_plan_id = pp.id) DESC
        LIMIT 1
      `,
      [id]
    );
    
    if (rows[0]) {
      try {
        if (rows[0].bom_product_name) {
          rows[0].product_name = rows[0].bom_product_name;
        } else if (rows[0].product_details) {
          const productDetails = typeof rows[0].product_details === 'string'
            ? JSON.parse(rows[0].product_details)
            : rows[0].product_details;
          rows[0].product_name = productDetails.itemName || productDetails.name || rows[0].project_name || null;
        } else {
          rows[0].product_name = rows[0].project_name || null;
        }
        delete rows[0].product_details;
        delete rows[0].bom_product_name;

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
        delete rows[0].selected_phases;
        
        rows[0].availablePhases = ensureArray(rows[0].available_phases);
        delete rows[0].available_phases;

        // Parse finished_goods, sub_assemblies, and materials
        rows[0].finished_goods = parseJson(rows[0].finished_goods, []);
        rows[0].sub_assemblies = parseJson(rows[0].sub_assemblies, []);
        rows[0].materials = parseJson(rows[0].materials, []);
      } catch (parseError) {
        console.warn(`Could not parse data for plan ${id}:`, parseError.message);
      }
    }
    
    return rows[0];
  }

  static async findBySalesOrderId(salesOrderId) {
    const [rows] = await pool.execute(
      `
        SELECT pp.*, 
               DATE_FORMAT(pp.planned_start_date, '%Y-%m-%d') as planned_start_date,
               DATE_FORMAT(pp.planned_end_date, '%Y-%m-%d') as planned_end_date,
               DATE_FORMAT(pp.estimated_completion_date, '%Y-%m-%d') as estimated_completion_date,
               p.id as project_id,
               COALESCE(so.customer, som.customer_name) AS customer_name,
               u.username AS supervisor_name,
               ppd.selected_phases,
               ppd.available_phases,
               ppd.finished_goods,
               ppd.sub_assemblies,
               ppd.materials,
               sod.product_details,
               bom.product_name as bom_product_name,
               bom.item_code as bom_item_code,
               p.name as project_name
        FROM production_plans pp
        LEFT JOIN sales_orders so ON so.id = pp.sales_order_id
        LEFT JOIN sales_orders_management som ON som.id = pp.sales_order_id
        LEFT JOIN projects p ON p.sales_order_id = pp.sales_order_id
        LEFT JOIN bill_of_materials bom ON (bom.id = pp.bom_id OR bom.id = som.bom_id)
        LEFT JOIN users u ON u.id = pp.supervisor_id
        LEFT JOIN production_plan_details ppd ON 
          (ppd.production_plan_id = pp.id) OR
          (ppd.production_plan_id IS NULL AND (
            (pp.sales_order_id IS NOT NULL AND ppd.sales_order_id = pp.sales_order_id) OR
            (pp.root_card_id IS NOT NULL AND ppd.root_card_id = pp.root_card_id)
          ))
        LEFT JOIN sales_order_details sod ON sod.sales_order_id = pp.sales_order_id
        WHERE pp.sales_order_id = ?
      `,
      [salesOrderId]
    );
    
    if (rows[0]) {
      try {
        if (rows[0].bom_product_name) {
          rows[0].product_name = rows[0].bom_product_name;
        } else if (rows[0].product_details) {
          const productDetails = typeof rows[0].product_details === 'string'
            ? JSON.parse(rows[0].product_details)
            : rows[0].product_details;
          rows[0].product_name = productDetails.itemName || productDetails.name || rows[0].project_name || null;
        } else {
          rows[0].product_name = rows[0].project_name || null;
        }
        delete rows[0].product_details;
        delete rows[0].bom_product_name;

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
        delete rows[0].selected_phases;

        rows[0].finished_goods = parseJson(rows[0].finished_goods, []);
        rows[0].sub_assemblies = parseJson(rows[0].sub_assemblies, []);
        rows[0].materials = parseJson(rows[0].materials, []);
      } catch (parseError) {
        console.warn(`Could not parse data for sales order ${salesOrderId}:`, parseError.message);
      }
    }
    
    return rows[0];
  }

  static async findByRootCardId(rootCardId) {
    const [rows] = await pool.execute(
      `
        SELECT pp.*, 
               DATE_FORMAT(pp.planned_start_date, '%Y-%m-%d') as planned_start_date,
               DATE_FORMAT(pp.planned_end_date, '%Y-%m-%d') as planned_end_date,
               DATE_FORMAT(pp.estimated_completion_date, '%Y-%m-%d') as estimated_completion_date,
               p.id as project_id,
               COALESCE(so.customer, som.customer_name) AS customer_name,
               u.username AS supervisor_name,
               ppd.selected_phases,
               ppd.available_phases,
               ppd.finished_goods,
               ppd.sub_assemblies,
               ppd.materials,
               sod.product_details,
               bom.product_name as bom_product_name,
               bom.item_code as bom_item_code,
               p.name as project_name
        FROM production_plans pp
        LEFT JOIN root_cards rc ON rc.id = pp.root_card_id
        LEFT JOIN sales_orders so ON so.id = pp.sales_order_id
        LEFT JOIN sales_orders_management som ON som.id = pp.sales_order_id
        LEFT JOIN projects p ON (p.sales_order_id = pp.sales_order_id OR p.id = rc.project_id)
        LEFT JOIN bill_of_materials bom ON (bom.id = pp.bom_id OR bom.id = som.bom_id)
        LEFT JOIN users u ON u.id = pp.supervisor_id
        LEFT JOIN production_plan_details ppd ON 
          (ppd.production_plan_id = pp.id) OR
          (ppd.production_plan_id IS NULL AND (
            (pp.sales_order_id IS NOT NULL AND ppd.sales_order_id = pp.sales_order_id) OR
            (pp.root_card_id IS NOT NULL AND ppd.root_card_id = pp.root_card_id)
          ))
        LEFT JOIN sales_order_details sod ON sod.sales_order_id = pp.sales_order_id
        WHERE pp.root_card_id = ?
      `,
      [rootCardId]
    );
    
    if (rows[0]) {
      try {
        if (rows[0].bom_product_name) {
          rows[0].product_name = rows[0].bom_product_name;
        } else if (rows[0].product_details) {
          const productDetails = typeof rows[0].product_details === 'string'
            ? JSON.parse(rows[0].product_details)
            : rows[0].product_details;
          rows[0].product_name = productDetails.itemName || productDetails.name || rows[0].project_name || null;
        } else {
          rows[0].product_name = rows[0].project_name || null;
        }
        delete rows[0].product_details;
        delete rows[0].bom_product_name;

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
        delete rows[0].selected_phases;

        rows[0].finished_goods = parseJson(rows[0].finished_goods, []);
        rows[0].sub_assemblies = parseJson(rows[0].sub_assemblies, []);
        rows[0].materials = parseJson(rows[0].materials, []);
      } catch (parseError) {
        console.warn(`Could not parse data for plan ${rows[0].id}:`, parseError.message);
      }
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

    if (filters.projectId) {
      conditions.push('(rc.project_id = ? OR p.id = ?)');
      params.push(filters.projectId, filters.projectId);
    }

    if (filters.search) {
      conditions.push('(pp.plan_name LIKE ? OR so.customer LIKE ?)');
      const like = `%${filters.search}%`;
      params.push(like, like);
    }

    let query = `
      SELECT pp.*, 
             DATE_FORMAT(pp.planned_start_date, '%Y-%m-%d') as planned_start_date,
             DATE_FORMAT(pp.planned_end_date, '%Y-%m-%d') as planned_end_date,
             DATE_FORMAT(pp.estimated_completion_date, '%Y-%m-%d') as estimated_completion_date,
             COALESCE(rc.project_id, p.id) as project_id,
             rc.title AS root_card_title,
             COALESCE(so.customer, som.customer_name) AS customer_name,
             u.username AS supervisor_name,
             ppd.selected_phases,
             ppd.available_phases,
             ppd.finished_goods,
             ppd.sub_assemblies,
             ppd.materials,
             sod.product_details,
             bom.product_name as bom_product_name,
             bom.item_code as bom_item_code,
             p.name as project_name,
             (SELECT COUNT(*) FROM material_requests WHERE production_plan_id = pp.id) as material_request_count
      FROM production_plans pp
      LEFT JOIN root_cards rc ON rc.id = pp.root_card_id
      LEFT JOIN sales_orders so ON so.id = pp.sales_order_id
      LEFT JOIN sales_orders_management som ON som.id = pp.sales_order_id
      LEFT JOIN projects p ON (p.sales_order_id = pp.sales_order_id OR p.id = rc.project_id)
      LEFT JOIN bill_of_materials bom ON (bom.id = pp.bom_id OR bom.id = som.bom_id)
      LEFT JOIN users u ON u.id = pp.supervisor_id
      LEFT JOIN production_plan_details ppd ON 
        (ppd.production_plan_id = pp.id) OR
        (ppd.production_plan_id IS NULL AND (
          (pp.sales_order_id IS NOT NULL AND ppd.sales_order_id = pp.sales_order_id) OR
          (pp.root_card_id IS NOT NULL AND ppd.root_card_id = pp.root_card_id)
        ))
      LEFT JOIN sales_order_details sod ON sod.sales_order_id = COALESCE(pp.sales_order_id, rc.sales_order_id)
    `;

    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY pp.created_at DESC';

    const [rows] = await pool.execute(query, params);
    
    const plansWithPhases = [];
    for (const plan of rows || []) {
      try {
        if (plan.bom_product_name) {
          plan.product_name = plan.bom_product_name;
        } else if (plan.product_details) {
          const productDetails = typeof plan.product_details === 'string'
            ? JSON.parse(plan.product_details)
            : plan.product_details;
          plan.product_name = productDetails.itemName || productDetails.name || plan.project_name || null;
        } else {
          plan.product_name = plan.project_name || null;
        }
        delete plan.product_details;
        delete plan.bom_product_name;

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

        plan.availablePhases = ensureArray(plan.available_phases);
        delete plan.available_phases;

        plan.finished_goods = parseJson(plan.finished_goods, []);
        plan.sub_assemblies = parseJson(plan.sub_assemblies, []);
        plan.materials = parseJson(plan.materials, []);
      } catch (parseError) {
        console.warn(`Could not parse data for plan ${plan.id}:`, parseError.message);
        plan.phases = [];
        plan.finished_goods = [];
        plan.sub_assemblies = [];
        plan.materials = [];
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
    const isPlanName = typeof id === 'string' && id.startsWith('PP-');
    await pool.execute(
      `
        UPDATE production_plans
        SET plan_name = ?, status = ?, root_card_id = ?, sales_order_id = ?, target_quantity = ?, 
            planned_start_date = ?, planned_end_date = ?, 
            estimated_completion_date = ?, supervisor_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE ${isPlanName ? 'plan_name = ?' : 'id = ?'}
      `,
      [
        data.planName,
        data.status,
        data.rootCardId || null,
        data.salesOrderId || null,
        data.targetQuantity || 1,
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
      // 1. Delete existing stages before adding new ones
      await connection.execute('DELETE FROM production_plan_stages WHERE production_plan_id = ?', [planId]);

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
        
        const isFirstStage = idx === 0;
        const isBlocked = !isFirstStage;
        
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
          stage.targetWarehouse || null,
          stage.notes || null,
          isBlocked ? 1 : 0,
          null
        ]);
      }

      console.log('[ProductionPlan.addStages] Inserting stages with values:', JSON.stringify(values, null, 2));

      const flattenedValues = values.reduce((acc, val) => acc.concat(val), []);
      const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');

      const query = `INSERT INTO production_plan_stages 
         (production_plan_id, stage_name, sequence, stage_type, duration_days, estimated_delay_days, 
          planned_start_date, planned_end_date, assigned_employee_id, assigned_facility_id, assigned_vendor_id, 
          target_warehouse, notes, is_blocked, blocked_by_stage_id)
         VALUES ${placeholders}`;
      
      console.log('[ProductionPlan.addStages] Query:', query);
      console.log('[ProductionPlan.addStages] Values:', flattenedValues);

      await connection.execute(query, flattenedValues);
      
      // Fetch the created stages to get their IDs
      const [createdStages] = await connection.execute(
        `SELECT id, stage_name, stage_type, sequence FROM production_plan_stages WHERE production_plan_id = ? ORDER BY sequence ASC`,
        [planId]
      );
      
      // Fetch plan details to get project_id, sales_order_id, root_card_id and product name for outsourcing_tasks
      const [planDetails] = await connection.execute(
        `SELECT pp.root_card_id, pp.sales_order_id, rc.project_id, so.items as so_items, sod.product_details
         FROM production_plans pp
         LEFT JOIN root_cards rc ON pp.root_card_id = rc.id
         LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
         LEFT JOIN sales_order_details sod ON pp.sales_order_id = sod.sales_order_id
         WHERE pp.id = ?`,
        [planId]
      );

      let productName = '-';
      if (planDetails.length > 0) {
        const details = planDetails[0];
        // Try product details first
        if (details.product_details) {
          try {
            const pd = typeof details.product_details === 'string' ? JSON.parse(details.product_details) : details.product_details;
            if (pd?.itemName) productName = pd.itemName;
          } catch (e) {}
        }
        // Try so items next
        if (productName === '-' && details.so_items) {
          try {
            const items = typeof details.so_items === 'string' ? JSON.parse(details.so_items) : details.so_items;
            if (Array.isArray(items) && items.length > 0) {
              productName = items[0].name || items[0].itemName || productName;
            }
          } catch (e) {}
        }
      }

      for (let i = 0; i < createdStages.length; i++) {
        const currentStage = createdStages[i];
        
        // Link stages for blocking
        if (i > 0) {
          const previousStage = createdStages[i - 1];
          await connection.execute(
            `UPDATE production_plan_stages SET blocked_by_stage_id = ? WHERE id = ?`,
            [previousStage.id, currentStage.id]
          );
          console.log(`[ProductionPlan.addStages] Stage ${currentStage.sequence} blocked by stage ${previousStage.sequence}`);
        }

        // Create outsourcing_tasks entry for outsource stages
        if (currentStage.stage_type === 'outsource') {
          console.log(`[ProductionPlan.addStages] Creating outsourcing_task for stage: ${currentStage.stage_name}`);
          await connection.execute(
            `INSERT INTO outsourcing_tasks 
             (production_plan_stage_id, production_plan_id, project_id, root_card_id, product_name, status)
             VALUES (?, ?, ?, ?, ?, 'pending')`,
            [
              currentStage.id,
              planId,
              planDetails[0]?.project_id || null,
              planDetails[0]?.root_card_id || null,
              productName,
            ]
          );
        }
      }

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
    const isPlanName = typeof id === 'string' && id.startsWith('PP-');
    
    // 1. Resolve numeric ID if plan_name was provided
    let numericId = id;
    if (isPlanName) {
      const plan = await this.findById(id);
      if (!plan) return; // Plan not found
      numericId = plan.id;
    }

    // 2. Unlink production_plan_details instead of deleting it
    // This preserves the wizard data even if the formal plan is deleted
    await pool.execute(
      'UPDATE production_plan_details SET production_plan_id = NULL WHERE production_plan_id = ?',
      [numericId]
    );

    // 3. Now delete the formal plan
    await pool.execute(
      'DELETE FROM production_plans WHERE id = ?',
      [numericId]
    );
  }
}

module.exports = ProductionPlan;
