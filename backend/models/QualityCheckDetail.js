const pool = require('../config/database');
const { parseJsonField, stringifyJsonField } = require('../utils/salesOrderHelpers');

class QualityCheckDetail {
  static async createTable() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS quality_check_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL UNIQUE,
        quality_standards VARCHAR(255),
        welding_standards VARCHAR(255),
        surface_finish VARCHAR(255),
        mechanical_load_testing VARCHAR(255),
        electrical_compliance VARCHAR(255),
        documents_required TEXT,
        warranty_period VARCHAR(100),
        service_support VARCHAR(255),
        internal_project_owner INT,
        qc_status ENUM('pending', 'in_progress', 'passed', 'failed', 'conditional') DEFAULT 'pending',
        inspected_by INT,
        inspection_date TIMESTAMP NULL,
        qc_report TEXT,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (internal_project_owner) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (inspected_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_sales_order (sales_order_id),
        INDEX idx_qc_status (qc_status)
      )
    `);
  }

  static async findBySalesOrderId(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT * FROM quality_check_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO quality_check_details 
       (sales_order_id, quality_standards, welding_standards, surface_finish, mechanical_load_testing,
        electrical_compliance, documents_required, warranty_period, service_support, internal_project_owner,
        qc_status, inspected_by, qc_report, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.salesOrderId,
        data.qualityCompliance?.qualityStandards || null,
        data.qualityCompliance?.weldingStandards || null,
        data.qualityCompliance?.surfaceFinish || null,
        data.qualityCompliance?.mechanicalLoadTesting || null,
        data.qualityCompliance?.electricalCompliance || null,
        data.qualityCompliance?.documentsRequired || null,
        data.warrantySupport?.warrantyPeriod || null,
        data.warrantySupport?.serviceSupport || null,
        data.internalProjectOwner || null,
        data.qcStatus || 'pending',
        data.inspectedBy || null,
        data.qcReport || null,
        data.remarks || null
      ]
    );
    return result.insertId;
  }

  static async update(salesOrderId, data) {
    await pool.execute(
      `UPDATE quality_check_details 
       SET quality_standards = ?, welding_standards = ?, surface_finish = ?, mechanical_load_testing = ?,
           electrical_compliance = ?, documents_required = ?, warranty_period = ?, service_support = ?,
           internal_project_owner = ?, qc_status = ?, inspected_by = ?, inspection_date = ?, 
           qc_report = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        data.qualityCompliance?.qualityStandards || null,
        data.qualityCompliance?.weldingStandards || null,
        data.qualityCompliance?.surfaceFinish || null,
        data.qualityCompliance?.mechanicalLoadTesting || null,
        data.qualityCompliance?.electricalCompliance || null,
        data.qualityCompliance?.documentsRequired || null,
        data.warrantySupport?.warrantyPeriod || null,
        data.warrantySupport?.serviceSupport || null,
        data.internalProjectOwner || null,
        data.qcStatus || 'pending',
        data.inspectedBy || null,
        data.qcStatus !== 'pending' && !data.inspectionDate ? new Date() : data.inspectionDate || null,
        data.qcReport || null,
        data.remarks || null,
        salesOrderId
      ]
    );
  }

  static async updateQCStatus(salesOrderId, status) {
    await pool.execute(
      `UPDATE quality_check_details 
       SET qc_status = ?, inspection_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [status, salesOrderId]
    );
  }

  static async addCompliance(salesOrderId, complianceData) {
    const detail = await this.findBySalesOrderId(salesOrderId);
    if (!detail) {
      throw new Error('Quality check data not found');
    }

    await pool.execute(
      `UPDATE quality_check_details 
       SET quality_standards = ?, welding_standards = ?, surface_finish = ?, 
           mechanical_load_testing = ?, electrical_compliance = ?, documents_required = ?
       WHERE sales_order_id = ?`,
      [
        complianceData.qualityStandards || null,
        complianceData.weldingStandards || null,
        complianceData.surfaceFinish || null,
        complianceData.mechanicalLoadTesting || null,
        complianceData.electricalCompliance || null,
        complianceData.documentsRequired || null,
        salesOrderId
      ]
    );

    return await this.findBySalesOrderId(salesOrderId);
  }

  static async addWarrantySupport(salesOrderId, warrantyData) {
    const detail = await this.findBySalesOrderId(salesOrderId);
    if (!detail) {
      throw new Error('Quality check data not found');
    }

    await pool.execute(
      `UPDATE quality_check_details 
       SET warranty_period = ?, service_support = ?
       WHERE sales_order_id = ?`,
      [
        warrantyData.warrantyPeriod || null,
        warrantyData.serviceSupport || null,
        salesOrderId
      ]
    );

    return await this.findBySalesOrderId(salesOrderId);
  }

  static async assignProjectOwner(salesOrderId, employeeId) {
    const detail = await this.findBySalesOrderId(salesOrderId);
    if (!detail) {
      throw new Error('Quality check data not found');
    }

    await pool.execute(
      `UPDATE quality_check_details SET internal_project_owner = ? WHERE sales_order_id = ?`,
      [employeeId || null, salesOrderId]
    );

    return await this.findBySalesOrderId(salesOrderId);
  }

  static async validateCompliance(salesOrderId) {
    const detail = await this.findBySalesOrderId(salesOrderId);
    if (!detail) {
      throw new Error('Quality check data not found');
    }

    const errors = [];
    const warnings = [];

    if (!detail.qualityCompliance?.qualityStandards) {
      warnings.push('Quality standards should be specified');
    }

    if (!detail.qualityCompliance?.documentsRequired) {
      warnings.push('Required documents should be specified');
    }

    if (!detail.warrantySupport?.warrantyPeriod) {
      warnings.push('Warranty period should be specified');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasCompliance: !!detail.qualityCompliance?.qualityStandards,
      hasWarranty: !!detail.warrantySupport?.warrantyPeriod
    };
  }

  static formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      salesOrderId: row.sales_order_id,
      qualityCompliance: {
        qualityStandards: row.quality_standards,
        weldingStandards: row.welding_standards,
        surfaceFinish: row.surface_finish,
        mechanicalLoadTesting: row.mechanical_load_testing,
        electricalCompliance: row.electrical_compliance,
        documentsRequired: row.documents_required
      },
      warrantySupport: {
        warrantyPeriod: row.warranty_period,
        serviceSupport: row.service_support
      },
      internalProjectOwner: row.internal_project_owner,
      qcStatus: row.qc_status,
      qcReport: row.qc_report,
      inspectedBy: row.inspected_by,
      inspectionDate: row.inspection_date,
      remarks: row.remarks,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = QualityCheckDetail;
