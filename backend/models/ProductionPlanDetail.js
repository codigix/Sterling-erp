const pool = require('../config/database');
const { parseJsonField, stringifyJsonField, normalizeStepData } = require('../utils/rootCardHelpers');

class ProductionPlanDetail {
  static async createTable() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS production_plan_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL UNIQUE,
        timeline JSON,
        selected_phases JSON,
        phase_details JSON,
        production_notes TEXT,
        estimated_completion_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        INDEX idx_sales_order (sales_order_id)
      )
    `);
  }

  static async findByRootCardId(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT ppd.*, sod.product_details 
       FROM production_plan_details ppd
       LEFT JOIN sales_order_details sod ON sod.sales_order_id = ppd.sales_order_id
       WHERE ppd.sales_order_id = ?`,
      [rootCardId]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async create(data) {
    const normalized = normalizeStepData(data, {
      productionStartDate: 'timeline.productionStartDate',
      estimatedCompletionDate: 'timeline.estimatedCompletionDate',
      procurementStatus: 'timeline.procurementStatus'
    });

    const timeline = {
      productionStartDate: normalized.productionStartDate,
      estimatedCompletionDate: normalized.estimatedCompletionDate,
      procurementStatus: normalized.procurementStatus
    };

    const params = [
      normalized.rootCardId || null,
      stringifyJsonField(timeline) || '{}',
      stringifyJsonField(normalized.selectedPhases) || '{}',
      stringifyJsonField(normalized.phaseDetails) || '{}',
      normalized.productionNotes || null,
      normalized.estimatedCompletionDate || null
    ];

    const [result] = await pool.execute(
      `INSERT INTO production_plan_details 
       (sales_order_id, timeline, selected_phases, phase_details, production_notes, estimated_completion_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      params
    );
    return result.insertId;
  }

  static async update(rootCardId, data) {
    const normalized = normalizeStepData(data, {
      productionStartDate: 'timeline.productionStartDate',
      estimatedCompletionDate: 'timeline.estimatedCompletionDate',
      procurementStatus: 'timeline.procurementStatus'
    });

    const timeline = {
      productionStartDate: normalized.productionStartDate,
      estimatedCompletionDate: normalized.estimatedCompletionDate,
      procurementStatus: normalized.procurementStatus
    };

    const params = [
      stringifyJsonField(timeline) || '{}',
      stringifyJsonField(normalized.selectedPhases) || '{}',
      stringifyJsonField(normalized.phaseDetails) || '{}',
      normalized.productionNotes || null,
      normalized.estimatedCompletionDate || null,
      rootCardId
    ];

    await pool.execute(
      `UPDATE production_plan_details 
       SET timeline = ?, selected_phases = ?, phase_details = ?, 
           production_notes = ?, estimated_completion_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      params
    );
  }

  static async addPhase(rootCardId, phaseKey, phaseData) {
    const detail = await this.findByRootCardId(rootCardId);
    if (!detail) {
      throw new Error('Production plan not found');
    }

    const phaseDetails = detail.phaseDetails || {};
    phaseDetails[phaseKey] = phaseData;

    await pool.execute(
      `UPDATE production_plan_details SET phase_details = ? WHERE sales_order_id = ?`,
      [stringifyJsonField(phaseDetails), rootCardId]
    );

    return phaseDetails[phaseKey];
  }

  static async getPhases(rootCardId) {
    const detail = await this.findByRootCardId(rootCardId);
    if (!detail) {
      throw new Error('Production plan not found');
    }
    return detail.phaseDetails || {};
  }

  static async getPhase(rootCardId, phaseKey) {
    const detail = await this.findByRootCardId(rootCardId);
    if (!detail) {
      throw new Error('Production plan not found');
    }
    const phaseDetails = detail.phaseDetails || {};
    return phaseDetails[phaseKey] || null;
  }

  static async updatePhase(rootCardId, phaseKey, phaseData) {
    const detail = await this.findByRootCardId(rootCardId);
    if (!detail) {
      throw new Error('Production plan not found');
    }

    const phaseDetails = detail.phaseDetails || {};
    if (!phaseDetails[phaseKey]) {
      throw new Error('Phase not found');
    }

    phaseDetails[phaseKey] = { ...phaseDetails[phaseKey], ...phaseData };

    await pool.execute(
      `UPDATE production_plan_details SET phase_details = ? WHERE sales_order_id = ?`,
      [stringifyJsonField(phaseDetails), rootCardId]
    );

    return phaseDetails[phaseKey];
  }

  static async removePhase(rootCardId, phaseKey) {
    const detail = await this.findByRootCardId(rootCardId);
    if (!detail) {
      throw new Error('Production plan not found');
    }

    const phaseDetails = detail.phaseDetails || {};
    if (!phaseDetails[phaseKey]) {
      throw new Error('Phase not found');
    }

    delete phaseDetails[phaseKey];

    await pool.execute(
      `UPDATE production_plan_details SET phase_details = ? WHERE sales_order_id = ?`,
      [stringifyJsonField(phaseDetails), rootCardId]
    );

    return true;
  }

  static async updatePhaseStatus(rootCardId, phaseKey, statusData) {
    const detail = await this.findByRootCardId(rootCardId);
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

    await pool.execute(
      `UPDATE production_plan_details SET phase_details = ? WHERE sales_order_id = ?`,
      [stringifyJsonField(phaseDetails), rootCardId]
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
      rootCardId: row.sales_order_id,
      productName: productName,
      timeline: timeline,
      selectedPhases: parseJsonField(row.selected_phases),
      phaseDetails: parseJsonField(row.phase_details),
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
