const pool = require('../config/database');
const { parseJsonField, stringifyJsonField, normalizeStepData, ensureArray } = require('../utils/rootCardHelpers');

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
        inspection_type VARCHAR(100),
        inspections JSON,
        inspected_by INT,
        inspection_date TIMESTAMP NULL,
        qc_report TEXT,
        remarks TEXT,
        payment_terms VARCHAR(255),
        special_instructions TEXT,
        estimated_costing DECIMAL(12,2),
        estimated_profit DECIMAL(12,2),
        job_card_no VARCHAR(100),
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

  static async findByRootCardId(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT * FROM quality_check_details WHERE sales_order_id = ?`,
      [rootCardId]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async create(data) {
    const normalized = normalizeStepData(data, {
      qcStatus: 'qualityCheck.qcStatus',
      inspectionType: 'qualityCheck.inspectionType',
      inspections: 'qualityCheck.inspections',
      qcReport: 'qualityCheck.qcReport',
      remarks: 'qualityCheck.remarks',
      paymentTerms: 'paymentTerms',
      specialInstructions: 'specialInstructions',
      estimatedCosting: 'internalInfo.estimatedCosting',
      estimatedProfit: 'internalInfo.estimatedProfit',
      jobCardNo: 'internalInfo.jobCardNo',
      inspectedBy: 'assignedTo'
    });

    const [result] = await pool.execute(
      `INSERT INTO quality_check_details 
       (sales_order_id, quality_standards, welding_standards, surface_finish, mechanical_load_testing,
        electrical_compliance, documents_required, warranty_period, service_support, internal_project_owner,
        qc_status, inspection_type, inspections, inspected_by, qc_report, remarks,
        payment_terms, special_instructions, estimated_costing, estimated_profit, job_card_no)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        normalized.rootCardId || null,
        normalized.qualityCompliance?.qualityStandards || null,
        normalized.qualityCompliance?.weldingStandards || null,
        normalized.qualityCompliance?.surfaceFinish || null,
        normalized.qualityCompliance?.mechanicalLoadTesting || null,
        normalized.qualityCompliance?.electricalCompliance || null,
        normalized.qualityCompliance?.documentsRequired || null,
        normalized.warrantySupport?.warrantyPeriod || null,
        normalized.warrantySupport?.serviceSupport || null,
        normalized.internalProjectOwner || null,
        normalized.qcStatus || 'pending',
        normalized.inspectionType || null,
        stringifyJsonField(ensureArray(normalized.inspections)) || '[]',
        normalized.inspectedBy || null,
        normalized.qcReport || null,
        normalized.remarks || null,
        normalized.paymentTerms || null,
        normalized.specialInstructions || null,
        normalized.estimatedCosting || null,
        normalized.estimatedProfit || null,
        normalized.jobCardNo || null
      ]
    );
    return result.insertId;
  }

  static async update(rootCardId, data) {
    const normalized = normalizeStepData(data, {
      qcStatus: 'qualityCheck.qcStatus',
      inspectionType: 'qualityCheck.inspectionType',
      inspections: 'qualityCheck.inspections',
      qcReport: 'qualityCheck.qcReport',
      remarks: 'qualityCheck.remarks',
      paymentTerms: 'paymentTerms',
      specialInstructions: 'specialInstructions',
      estimatedCosting: 'internalInfo.estimatedCosting',
      estimatedProfit: 'internalInfo.estimatedProfit',
      jobCardNo: 'internalInfo.jobCardNo',
      inspectedBy: 'assignedTo'
    });

    await pool.execute(
      `UPDATE quality_check_details 
       SET quality_standards = ?, welding_standards = ?, surface_finish = ?, mechanical_load_testing = ?,
           electrical_compliance = ?, documents_required = ?, warranty_period = ?, service_support = ?,
           internal_project_owner = ?, qc_status = ?, inspection_type = ?, inspections = ?, 
           inspected_by = ?, inspection_date = ?, 
           qc_report = ?, remarks = ?, 
           payment_terms = ?, special_instructions = ?, estimated_costing = ?, 
           estimated_profit = ?, job_card_no = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        normalized.qualityCompliance?.qualityStandards || null,
        normalized.qualityCompliance?.weldingStandards || null,
        normalized.qualityCompliance?.surfaceFinish || null,
        normalized.qualityCompliance?.mechanicalLoadTesting || null,
        normalized.qualityCompliance?.electricalCompliance || null,
        normalized.qualityCompliance?.documentsRequired || null,
        normalized.warrantySupport?.warrantyPeriod || null,
        normalized.warrantySupport?.serviceSupport || null,
        normalized.internalProjectOwner || null,
        normalized.qcStatus || 'pending',
        normalized.inspectionType || null,
        stringifyJsonField(ensureArray(normalized.inspections)) || '[]',
        normalized.inspectedBy || null,
        normalized.qcStatus !== 'pending' && !normalized.inspectionDate ? new Date() : normalized.inspectionDate || null,
        normalized.qcReport || null,
        normalized.remarks || null,
        normalized.paymentTerms || null,
        normalized.specialInstructions || null,
        normalized.estimatedCosting || null,
        normalized.estimatedProfit || null,
        normalized.jobCardNo || null,
        rootCardId
      ]
    );
  }

  static async updateQCStatus(rootCardId, status) {
    await pool.execute(
      `UPDATE quality_check_details 
       SET qc_status = ?, inspection_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [status, rootCardId]
    );
  }

  static async addCompliance(rootCardId, complianceData) {
    const detail = await this.findByRootCardId(rootCardId);
    if (!detail) return null;

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
        rootCardId
      ]
    );

    return await this.findByRootCardId(rootCardId);
  }

  static async addWarrantySupport(rootCardId, warrantyData) {
    const detail = await this.findByRootCardId(rootCardId);
    if (!detail) return null;

    await pool.execute(
      `UPDATE quality_check_details 
       SET warranty_period = ?, service_support = ?
       WHERE sales_order_id = ?`,
      [
        warrantyData.warrantyPeriod || null,
        warrantyData.serviceSupport || null,
        rootCardId
      ]
    );

    return await this.findByRootCardId(rootCardId);
  }

  static async assignProjectOwner(rootCardId, employeeId) {
    const detail = await this.findByRootCardId(rootCardId);
    if (!detail) return null;

    await pool.execute(
      `UPDATE quality_check_details SET internal_project_owner = ? WHERE sales_order_id = ?`,
      [employeeId || null, rootCardId]
    );

    return await this.findByRootCardId(rootCardId);
  }

  static async validateCompliance(rootCardId) {
    const detail = await this.findByRootCardId(rootCardId);
    
    if (!detail) {
      return {
        isValid: true,
        errors: [],
        warnings: ['No quality check data found'],
        hasCompliance: false,
        hasWarranty: false
      };
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
    const inspections = ensureArray(parseJsonField(row.inspections, []));
    return {
      id: row.id,
      rootCardId: row.sales_order_id,
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
      qualityCheck: {
        qcStatus: row.qc_status,
        inspectionType: row.inspection_type,
        inspections: inspections,
        qcReport: row.qc_report,
        remarks: row.remarks
      },
      internalProjectOwner: row.internal_project_owner,
      qcStatus: row.qc_status,
      inspectionType: row.inspection_type,
      inspections: inspections,
      qcReport: row.qc_report,
      inspectedBy: row.inspected_by,
      inspectionDate: row.inspection_date,
      remarks: row.remarks,
      paymentTerms: row.payment_terms,
      specialInstructions: row.special_instructions,
      internalInfo: {
        estimatedCosting: row.estimated_costing,
        estimatedProfit: row.estimated_profit,
        jobCardNo: row.job_card_no
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = QualityCheckDetail;
