const pool = require('../config/database');
const { parseJsonField, stringifyJsonField } = require('../utils/salesOrderHelpers');

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

  static async findBySalesOrderId(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT * FROM production_plan_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async create(data) {
    const params = [
      data.salesOrderId,
      stringifyJsonField(data.timeline) || JSON.stringify({}),
      stringifyJsonField(data.selectedPhases) || JSON.stringify({}),
      stringifyJsonField(data.phaseDetails) || JSON.stringify({}),
      data.productionNotes || null,
      data.estimatedCompletionDate || null
    ];

    const [result] = await pool.execute(
      `INSERT INTO production_plan_details 
       (sales_order_id, timeline, selected_phases, phase_details, production_notes, estimated_completion_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      params
    );
    return result.insertId;
  }

  static async update(salesOrderId, data) {
    const params = [
      stringifyJsonField(data.timeline) || JSON.stringify({}),
      stringifyJsonField(data.selectedPhases) || JSON.stringify({}),
      stringifyJsonField(data.phaseDetails) || JSON.stringify({}),
      data.productionNotes || null,
      data.estimatedCompletionDate || null,
      salesOrderId
    ];

    await pool.execute(
      `UPDATE production_plan_details 
       SET timeline = ?, selected_phases = ?, phase_details = ?, 
           production_notes = ?, estimated_completion_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      params
    );
  }

  static async addPhase(salesOrderId, phaseKey, phaseData) {
    const detail = await this.findBySalesOrderId(salesOrderId);
    if (!detail) {
      throw new Error('Production plan not found');
    }

    const phaseDetails = detail.phaseDetails || {};
    phaseDetails[phaseKey] = phaseData;

    await pool.execute(
      `UPDATE production_plan_details SET phase_details = ? WHERE sales_order_id = ?`,
      [stringifyJsonField(phaseDetails), salesOrderId]
    );

    return phaseDetails[phaseKey];
  }

  static async getPhases(salesOrderId) {
    const detail = await this.findBySalesOrderId(salesOrderId);
    if (!detail) {
      throw new Error('Production plan not found');
    }
    return detail.phaseDetails || {};
  }

  static async getPhase(salesOrderId, phaseKey) {
    const detail = await this.findBySalesOrderId(salesOrderId);
    if (!detail) {
      throw new Error('Production plan not found');
    }
    const phaseDetails = detail.phaseDetails || {};
    return phaseDetails[phaseKey] || null;
  }

  static async updatePhase(salesOrderId, phaseKey, phaseData) {
    const detail = await this.findBySalesOrderId(salesOrderId);
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
      [stringifyJsonField(phaseDetails), salesOrderId]
    );

    return phaseDetails[phaseKey];
  }

  static async removePhase(salesOrderId, phaseKey) {
    const detail = await this.findBySalesOrderId(salesOrderId);
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
      [stringifyJsonField(phaseDetails), salesOrderId]
    );

    return true;
  }

  static async updatePhaseStatus(salesOrderId, phaseKey, statusData) {
    const detail = await this.findBySalesOrderId(salesOrderId);
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
      [stringifyJsonField(phaseDetails), salesOrderId]
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

  static async validatePhases(salesOrderId) {
    const detail = await this.findBySalesOrderId(salesOrderId);
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
    return {
      id: row.id,
      salesOrderId: row.sales_order_id,
      timeline: parseJsonField(row.timeline),
      selectedPhases: parseJsonField(row.selected_phases),
      phaseDetails: parseJsonField(row.phase_details),
      productionNotes: row.production_notes,
      procurementStatus: row.procurement_status,
      productionStartDate: row.production_start_date,
      estimatedCompletionDate: row.estimated_completion_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = ProductionPlanDetail;
