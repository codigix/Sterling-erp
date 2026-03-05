const pool = require('../config/database');
const { parseJsonField, stringifyJsonField, normalizeStepData, ensureArray } = require('../utils/rootCardHelpers');

class ProductionPlanDetail {
  static async createTable() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS production_plan_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        production_plan_id INT NULL,
        sales_order_id INT NULL,
        root_card_id INT NULL,
        timeline JSON,
        selected_phases JSON,
        available_phases JSON,
        phase_details JSON,
        materials JSON,
        sub_assemblies JSON,
        finished_goods JSON,
        production_notes TEXT,
        estimated_completion_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE SET NULL,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (root_card_id) REFERENCES root_cards(id) ON DELETE CASCADE,
        INDEX idx_production_plan (production_plan_id),
        INDEX idx_sales_order (sales_order_id),
        INDEX idx_root_card (root_card_id)
      )
    `);
  }

  static async findByProductionPlanId(planId) {
    const [rows] = await pool.execute(
      `SELECT ppd.*, 
              DATE_FORMAT(ppd.estimated_completion_date, '%Y-%m-%d') as estimated_completion_date,
              sod.product_details 
       FROM production_plan_details ppd
       LEFT JOIN production_plans pp ON pp.id = ppd.production_plan_id
       LEFT JOIN sales_order_details sod ON sod.sales_order_id = COALESCE(ppd.sales_order_id, pp.sales_order_id)
       WHERE ppd.production_plan_id = ?`,
      [planId]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async findBySalesOrderId(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT ppd.*, 
              DATE_FORMAT(ppd.estimated_completion_date, '%Y-%m-%d') as estimated_completion_date,
              sod.product_details 
       FROM production_plan_details ppd
       LEFT JOIN sales_order_details sod ON sod.sales_order_id = ppd.sales_order_id
       WHERE ppd.sales_order_id = ?`,
      [salesOrderId]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async findByRootCardId(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT ppd.*,
              DATE_FORMAT(ppd.estimated_completion_date, '%Y-%m-%d') as estimated_completion_date
       FROM production_plan_details ppd
       WHERE ppd.root_card_id = ? OR ppd.sales_order_id = ?`,
      [rootCardId, rootCardId]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT ppd.*, 
              DATE_FORMAT(ppd.estimated_completion_date, '%Y-%m-%d') as estimated_completion_date,
              sod.product_details 
       FROM production_plan_details ppd
       LEFT JOIN sales_order_details sod ON sod.sales_order_id = ppd.sales_order_id
       WHERE ppd.id = ?`,
      [id]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async create(data) {
    const rootCardId = data.rootCardId || data.salesOrderId;
    
    // Safety check: if record already exists, update it instead
    if (rootCardId) {
      const existing = await this.findByRootCardId(rootCardId);
      if (existing) {
        console.log(`[ProductionPlanDetail] Record already exists for ID ${rootCardId}. Redirecting to update.`);
        return this.update(rootCardId, data, !!data.rootCardId);
      }
    }

    const normalized = normalizeStepData(data, {
      productionStartDate: 'timeline.startDate',
      estimatedCompletionDate: 'timeline.endDate',
      procurementStatus: 'timeline.procurementStatus'
    });

    const timeline = {
      productionStartDate: data.productionStartDate || normalized.productionStartDate || (data.timeline?.startDate) || null,
      estimatedCompletionDate: data.estimatedCompletionDate || normalized.estimatedCompletionDate || (data.timeline?.endDate) || null,
      procurementStatus: data.procurementStatus || normalized.procurementStatus || (data.timeline?.procurementStatus) || null
    };

    const params = [
      data.productionPlanId || null,
      data.salesOrderId || null,
      data.root_card_id || data.rootCardId || null,
      stringifyJsonField(timeline) || '{}',
      stringifyJsonField(data.selectedPhases || normalized.selectedPhases) || '{}',
      stringifyJsonField(ensureArray(data.availablePhases || [])) || '[]',
      stringifyJsonField(data.phaseDetails || normalized.phaseDetails) || '{}',
      stringifyJsonField(data.materials) || '[]',
      stringifyJsonField(data.subAssemblies) || '[]',
      stringifyJsonField(data.finishedGoods) || '[]',
      data.productionNotes || normalized.productionNotes || null,
      data.estimatedCompletionDate || normalized.estimatedCompletionDate || null
    ];

    const [result] = await pool.execute(
      `INSERT INTO production_plan_details 
       (production_plan_id, sales_order_id, root_card_id, timeline, selected_phases, available_phases, phase_details, materials, sub_assemblies, finished_goods, production_notes, estimated_completion_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );
    return result.insertId;
  }

  static async update(id, data, isRootCard = false, detailId = null) {
    // 1. Fetch existing record first to perform a partial update
    let existing = null;
    if (detailId) {
      existing = await this.findById(detailId);
    } else {
      existing = isRootCard ? await this.findByRootCardId(id) : await this.findBySalesOrderId(id);
    }

    if (!existing) {
      console.warn(`[ProductionPlanDetail.update] No existing record found for ID ${id}. Creating new one.`);
      return this.create({ ...data, rootCardId: isRootCard ? id : null, salesOrderId: !isRootCard ? id : null });
    }

    const normalized = normalizeStepData(data, {
      productionStartDate: 'timeline.startDate',
      estimatedCompletionDate: 'timeline.endDate',
      procurementStatus: 'timeline.procurementStatus'
    });

    // Merge timeline data carefully to avoid overwriting with null
    const existingTimeline = existing.timeline || {};
    const timeline = {
      productionStartDate: data.productionStartDate || normalized.productionStartDate || (data.timeline && data.timeline.startDate) || existingTimeline.productionStartDate || null,
      estimatedCompletionDate: data.estimatedCompletionDate || normalized.estimatedCompletionDate || (data.timeline && data.timeline.endDate) || existingTimeline.estimatedCompletionDate || null,
      procurementStatus: data.procurementStatus || normalized.procurementStatus || (data.timeline && data.timeline.procurementStatus) || existingTimeline.procurementStatus || null
    };

    // Prepare fields for update, only if they are provided in data
    const fields = [];
    const params = [];

    fields.push('timeline = ?');
    params.push(stringifyJsonField(timeline) || '{}');

    if (data.selectedPhases !== undefined || normalized.selectedPhases !== undefined) {
      fields.push('selected_phases = ?');
      params.push(stringifyJsonField(data.selectedPhases || normalized.selectedPhases) || '{}');
    }

    if (data.availablePhases !== undefined) {
      fields.push('available_phases = ?');
      params.push(stringifyJsonField(ensureArray(data.availablePhases)) || '[]');
    }

    if (data.phaseDetails !== undefined || normalized.phaseDetails !== undefined) {
      fields.push('phase_details = ?');
      params.push(stringifyJsonField(data.phaseDetails || normalized.phaseDetails) || '{}');
    }

    if (data.materials !== undefined) {
      fields.push('materials = ?');
      params.push(stringifyJsonField(data.materials) || '[]');
    }

    if (data.subAssemblies !== undefined) {
      fields.push('sub_assemblies = ?');
      params.push(stringifyJsonField(data.subAssemblies) || '[]');
    }

    if (data.finishedGoods !== undefined) {
      fields.push('finished_goods = ?');
      params.push(stringifyJsonField(data.finishedGoods) || '[]');
    }

    if (data.productionNotes !== undefined || normalized.productionNotes !== undefined) {
      fields.push('production_notes = ?');
      params.push(data.productionNotes || normalized.productionNotes || null);
    }

    if (data.estimatedCompletionDate !== undefined || normalized.estimatedCompletionDate !== undefined) {
      fields.push('estimated_completion_date = ?');
      params.push(data.estimatedCompletionDate || normalized.estimatedCompletionDate || null);
    }

    if (data.productionPlanId !== undefined) {
      fields.push('production_plan_id = COALESCE(production_plan_id, ?)');
      params.push(data.productionPlanId || null);
    }

    if (fields.length === 0) return;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    
    const sql = `UPDATE production_plan_details SET ${fields.join(', ')} WHERE id = ?`;
    await pool.execute(sql, [...params, existing.id]);
  }

  static async addPhase(id, phaseKey, phaseData, isRootCard = true) {
    const detail = isRootCard ? await this.findByRootCardId(id) : await this.findBySalesOrderId(id);
    if (!detail) {
      throw new Error('Production plan not found');
    }

    const phaseDetails = detail.phaseDetails || {};
    phaseDetails[phaseKey] = phaseData;

    const whereColumn = isRootCard ? 'root_card_id' : 'sales_order_id';

    await pool.execute(
      `UPDATE production_plan_details SET phase_details = ? WHERE ${whereColumn} = ?`,
      [stringifyJsonField(phaseDetails), id]
    );

    return phaseDetails[phaseKey];
  }

  static async getPhases(id, isRootCard = true) {
    const detail = isRootCard ? await this.findByRootCardId(id) : await this.findBySalesOrderId(id);
    if (!detail) {
      throw new Error('Production plan not found');
    }
    return detail.phaseDetails || {};
  }

  static async getPhase(id, phaseKey, isRootCard = true) {
    const detail = isRootCard ? await this.findByRootCardId(id) : await this.findBySalesOrderId(id);
    if (!detail) {
      throw new Error('Production plan not found');
    }
    const phaseDetails = detail.phaseDetails || {};
    return phaseDetails[phaseKey] || null;
  }

  static async updatePhase(id, phaseKey, phaseData, isRootCard = true) {
    const detail = isRootCard ? await this.findByRootCardId(id) : await this.findBySalesOrderId(id);
    if (!detail) {
      throw new Error('Production plan not found');
    }

    const phaseDetails = detail.phaseDetails || {};
    if (!phaseDetails[phaseKey]) {
      throw new Error('Phase not found');
    }

    phaseDetails[phaseKey] = { ...phaseDetails[phaseKey], ...phaseData };

    const whereColumn = isRootCard ? 'root_card_id' : 'sales_order_id';

    await pool.execute(
      `UPDATE production_plan_details SET phase_details = ? WHERE ${whereColumn} = ?`,
      [stringifyJsonField(phaseDetails), id]
    );

    return phaseDetails[phaseKey];
  }

  static async removePhase(id, phaseKey, isRootCard = true) {
    const detail = isRootCard ? await this.findByRootCardId(id) : await this.findBySalesOrderId(id);
    if (!detail) {
      throw new Error('Production plan not found');
    }

    const phaseDetails = detail.phaseDetails || {};
    if (!phaseDetails[phaseKey]) {
      throw new Error('Phase not found');
    }

    delete phaseDetails[phaseKey];

    const whereColumn = isRootCard ? 'root_card_id' : 'sales_order_id';

    await pool.execute(
      `UPDATE production_plan_details SET phase_details = ? WHERE ${whereColumn} = ?`,
      [stringifyJsonField(phaseDetails), id]
    );

    return true;
  }

  static async updatePhaseStatus(id, phaseKey, statusData, isRootCard = true) {
    const detail = isRootCard ? await this.findByRootCardId(id) : await this.findBySalesOrderId(id);
    if (!detail) {
      throw new Error('Production plan not found');
    }

    const phaseDetails = detail.phaseDetails || {};
    if (!phaseDetails[phaseKey]) {
      throw new Error('Phase not found');
    }

    phaseDetails[phaseKey] = {
      ...phaseDetails[phaseKey],
      status: statusData.status,
      startTime: statusData.startTime || phaseDetails[phaseKey].startTime,
      finishTime: statusData.finishTime || phaseDetails[phaseKey].finishTime
    };

    const whereColumn = isRootCard ? 'root_card_id' : 'sales_order_id';

    await pool.execute(
      `UPDATE production_plan_details SET phase_details = ? WHERE ${whereColumn} = ?`,
      [stringifyJsonField(phaseDetails), id]
    );

    return phaseDetails[phaseKey];
  }

  static async validateTimeline(data) {
    const errors = [];
    const warnings = [];

    if (!data.productionStartDate) {
      errors.push('Production start date is required');
    }

    if (!data.estimatedCompletionDate) {
      errors.push('Estimated completion date is required');
    }

    if (data.productionStartDate && data.estimatedCompletionDate) {
      const startDate = new Date(data.productionStartDate);
      const endDate = new Date(data.estimatedCompletionDate);
      if (startDate >= endDate) {
        errors.push('Estimated completion date must be after production start date');
      }
    }

    if (!data.procurementStatus) {
      warnings.push('Procurement status should be specified');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static async validatePhases(rootCardId) {
    const detail = await this.findByRootCardId(rootCardId);
    if (!detail) {
      throw new Error('Production plan not found');
    }

    const errors = [];
    const warnings = [];
    const phaseDetails = detail.phaseDetails || {};

    if (Object.keys(phaseDetails).length === 0) {
      warnings.push('No production phases have been added');
    }

    Object.entries(phaseDetails).forEach(([key, phase]) => {
      if (!phase.status) {
        errors.push(`Phase ${key} has no status`);
      }

      if (!phase.assignee) {
        warnings.push(`Phase ${key} has no assignee`);
      }

      if (!phase.phase || !phase.subTask) {
        errors.push(`Phase ${key} is missing phase or subtask information`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      totalPhases: Object.keys(phaseDetails).length
    };
  }

  static formatRow(row) {
    if (!row) return null;
    const timeline = parseJsonField(row.timeline) || {};
    
    let productName = null;
    if (row.product_details) {
      try {
        const details = typeof row.product_details === 'string' 
          ? JSON.parse(row.product_details) 
          : row.product_details;
        productName = details.itemName || null;
      } catch (e) {
        console.warn('Error parsing product_details');
      }
    }

    return {
      id: row.id,
      productionPlanId: row.production_plan_id,
      salesOrderId: row.sales_order_id,
      rootCardId: row.root_card_id,
      productName: productName,
      timeline: timeline,
      selectedPhases: parseJsonField(row.selected_phases),
      availablePhases: ensureArray(parseJsonField(row.available_phases, [])),
      phaseDetails: parseJsonField(row.phase_details),
      materials: parseJsonField(row.materials) || [],
      subAssemblies: parseJsonField(row.sub_assemblies) || [],
      finishedGoods: parseJsonField(row.finished_goods) || [],
      productionNotes: row.production_notes,
      procurementStatus: timeline.procurementStatus,
      productionStartDate: timeline.productionStartDate,
      estimatedCompletionDate: row.estimated_completion_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = ProductionPlanDetail;
