const pool = require('../config/database');
const { parseJsonField, stringifyJsonField, normalizeStepData } = require('../utils/rootCardHelpers');

class DeliveryDetail {
  static async createTable() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS delivery_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL UNIQUE,
        
        actual_delivery_date DATE,
        customer_contact VARCHAR(255),
        installation_completed VARCHAR(500),
        site_commissioning_completed VARCHAR(500),
        warranty_terms_acceptance VARCHAR(500),
        completion_remarks TEXT,
        project_manager VARCHAR(255),
        production_supervisor VARCHAR(255),
        assigned_to INT,
        
        delivery_date DATE,
        received_by VARCHAR(255),
        delivery_status ENUM('pending', 'in_progress', 'delivered', 'failed', 'partial', 'complete', 'signed', 'cancelled') DEFAULT 'pending',
        delivered_quantity INT,
        recipient_signature_path VARCHAR(500),
        delivery_notes TEXT,
        pod_number VARCHAR(100),
        delivery_cost DECIMAL(12,2),
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL,
        INDEX idx_sales_order (sales_order_id),
        INDEX idx_delivery_status (delivery_status),
        INDEX idx_assigned_to (assigned_to)
      )
    `);
  }

  static async findByRootCardId(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT * FROM delivery_details WHERE sales_order_id = ?`,
      [rootCardId]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async create(data) {
    const normalized = normalizeStepData(data, {
      actualDeliveryDate: 'delivery.actualDeliveryDate',
      customerContact: 'delivery.customerContact',
      installationCompleted: 'delivery.installationCompleted',
      siteCommissioningCompleted: 'delivery.siteCommissioningCompleted',
      warrantyTermsAcceptance: 'delivery.warrantyTermsAcceptance',
      completionRemarks: 'delivery.completionRemarks',
      projectManager: 'delivery.projectManager',
      productionSupervisor: 'delivery.productionSupervisor',
      receivedBy: 'delivery.deliveredTo',
      deliveryDate: 'delivery.deliveryDate',
      podNumber: 'delivery.podNumber',
      deliveredQuantity: 'delivery.deliveredQuantity',
      deliveryCost: 'delivery.deliveryCost',
      deliveryNotes: 'delivery.deliveryNotes',
      assignedTo: 'deliveryAssignedTo'
    });

    const [result] = await pool.execute(
      `INSERT INTO delivery_details 
       (sales_order_id, actual_delivery_date, customer_contact, installation_completed,
        site_commissioning_completed, warranty_terms_acceptance, completion_remarks,
        project_manager, production_supervisor, assigned_to, delivery_date, received_by, delivery_status,
        delivered_quantity, recipient_signature_path, delivery_notes, pod_number, delivery_cost)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        normalized.rootCardId || null,
        normalized.actualDeliveryDate || null,
        normalized.customerContact || null,
        normalized.installationCompleted || null,
        normalized.siteCommissioningCompleted || null,
        normalized.warrantyTermsAcceptance || null,
        normalized.completionRemarks || null,
        normalized.projectManager || null,
        normalized.productionSupervisor || null,
        normalized.assignedTo || null,
        normalized.deliveryDate || null,
        normalized.receivedBy || null,
        normalized.deliveryStatus || 'pending',
        normalized.deliveredQuantity || null,
        normalized.recipientSignaturePath || null,
        normalized.deliveryNotes || null,
        normalized.podNumber || null,
        normalized.deliveryCost || null
      ]
    );
    return result.insertId;
  }

  static async update(rootCardId, data) {
    const normalized = normalizeStepData(data, {
      actualDeliveryDate: 'delivery.actualDeliveryDate',
      customerContact: 'delivery.customerContact',
      installationCompleted: 'delivery.installationCompleted',
      siteCommissioningCompleted: 'delivery.siteCommissioningCompleted',
      warrantyTermsAcceptance: 'delivery.warrantyTermsAcceptance',
      completionRemarks: 'delivery.completionRemarks',
      projectManager: 'delivery.projectManager',
      productionSupervisor: 'delivery.productionSupervisor',
      receivedBy: 'delivery.deliveredTo',
      deliveryDate: 'delivery.deliveryDate',
      podNumber: 'delivery.podNumber',
      deliveredQuantity: 'delivery.deliveredQuantity',
      deliveryCost: 'delivery.deliveryCost',
      deliveryNotes: 'delivery.deliveryNotes',
      assignedTo: 'deliveryAssignedTo'
    });

    await pool.execute(
      `UPDATE delivery_details 
       SET actual_delivery_date = ?, customer_contact = ?, installation_completed = ?,
           site_commissioning_completed = ?, warranty_terms_acceptance = ?, completion_remarks = ?,
           project_manager = ?, production_supervisor = ?, assigned_to = ?, delivery_date = ?, received_by = ?,
           delivery_status = ?, delivered_quantity = ?, recipient_signature_path = ?,
           delivery_notes = ?, pod_number = ?, delivery_cost = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        normalized.actualDeliveryDate || null,
        normalized.customerContact || null,
        normalized.installationCompleted || null,
        normalized.siteCommissioningCompleted || null,
        normalized.warrantyTermsAcceptance || null,
        normalized.completionRemarks || null,
        normalized.projectManager || null,
        normalized.productionSupervisor || null,
        normalized.assignedTo || null,
        normalized.deliveryDate || null,
        normalized.receivedBy || null,
        normalized.deliveryStatus || 'pending',
        normalized.deliveredQuantity || null,
        normalized.recipientSignaturePath || null,
        normalized.deliveryNotes || null,
        normalized.podNumber || null,
        normalized.deliveryCost || null,
        rootCardId
      ]
    );
  }

  static async updateDeliveryStatus(rootCardId, status) {
    await pool.execute(
      `UPDATE delivery_details 
       SET delivery_status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [status, rootCardId]
    );
  }

  static async updateFinalDelivery(rootCardId, deliveryInfo) {
    await pool.execute(
      `UPDATE delivery_details 
       SET actual_delivery_date = ?, customer_contact = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        deliveryInfo.actualDeliveryDate || null,
        deliveryInfo.customerContact || null,
        rootCardId
      ]
    );
  }

  static async updateInstallationStatus(rootCardId, installationInfo) {
    await pool.execute(
      `UPDATE delivery_details 
       SET installation_completed = ?, site_commissioning_completed = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        installationInfo.installationCompleted || null,
        installationInfo.siteCommissioningCompleted || null,
        rootCardId
      ]
    );
  }

  static async updateWarrantyInfo(rootCardId, warrantyInfo) {
    await pool.execute(
      `UPDATE delivery_details 
       SET warranty_terms_acceptance = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        warrantyInfo.warrantyTermsAcceptance || null,
        rootCardId
      ]
    );
  }

  static async updateProjectCompletion(rootCardId, completionInfo) {
    await pool.execute(
      `UPDATE delivery_details 
       SET completion_remarks = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        completionInfo.completionRemarks || null,
        rootCardId
      ]
    );
  }

  static async updateInternalInfo(rootCardId, internalInfo) {
    await pool.execute(
      `UPDATE delivery_details 
       SET project_manager = ?, production_supervisor = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        internalInfo.projectManager || null,
        internalInfo.productionSupervisor || null,
        rootCardId
      ]
    );
  }

  static async validateDelivery(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT actual_delivery_date, customer_contact, installation_completed,
              site_commissioning_completed, warranty_terms_acceptance, completion_remarks,
              project_manager, production_supervisor, delivery_status
       FROM delivery_details WHERE sales_order_id = ?`,
      [rootCardId]
    );

    if (!rows || rows.length === 0) {
      return { isValid: false, errors: ['Delivery details not found'] };
    }

    const row = rows[0];
    const errors = [];
    const warnings = [];

    if (!row.actual_delivery_date) warnings.push('Actual delivery date not set');
    if (!row.customer_contact) warnings.push('Customer contact information missing');
    if (!row.installation_completed) warnings.push('Installation status not specified');
    if (!row.site_commissioning_completed) warnings.push('Site commissioning status not specified');
    if (!row.warranty_terms_acceptance) warnings.push('Warranty terms not confirmed');
    if (!row.completion_remarks) warnings.push('Completion remarks not provided');
    if (!row.project_manager) warnings.push('Project manager not assigned');
    if (!row.production_supervisor) warnings.push('Production supervisor not assigned');

    if (row.delivery_status === 'delivered' || row.delivery_status === 'complete') {
      if (!row.actual_delivery_date) errors.push('Delivery date required for completed deliveries');
      if (!row.customer_contact) errors.push('Customer contact required for completed deliveries');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      rootCardId: row.sales_order_id,
      actualDeliveryDate: row.actual_delivery_date,
      customerContact: row.customer_contact,
      installationCompleted: row.installation_completed,
      siteCommissioningCompleted: row.site_commissioning_completed,
      warrantyTermsAcceptance: row.warranty_terms_acceptance,
      completionRemarks: row.completion_remarks,
      projectManager: row.project_manager,
      productionSupervisor: row.production_supervisor,
      delivery: {
        actualDeliveryDate: row.actual_delivery_date,
        customerContact: row.customer_contact,
        installationCompleted: row.installation_completed,
        siteCommissioningCompleted: row.site_commissioning_completed,
        warrantyTermsAcceptance: row.warranty_terms_acceptance,
        completionRemarks: row.completion_remarks,
        deliveredTo: row.received_by,
        projectManager: row.project_manager,
        productionSupervisor: row.production_supervisor,
        deliveryDate: row.delivery_date,
        podNumber: row.pod_number,
        deliveredQuantity: row.delivered_quantity,
        deliveryCost: row.delivery_cost,
        deliveryNotes: row.delivery_notes
      },
      internalInfo: {
        projectManager: row.project_manager,
        productionSupervisor: row.production_supervisor
      },
      assignedTo: row.assigned_to,
      deliveryAssignedTo: row.assigned_to,
      deliveryDate: row.delivery_date,
      receivedBy: row.received_by,
      deliveryStatus: row.delivery_status,
      deliveredQuantity: row.delivered_quantity,
      recipientSignaturePath: row.recipient_signature_path,
      deliveryNotes: row.delivery_notes,
      podNumber: row.pod_number,
      deliveryCost: row.delivery_cost,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = DeliveryDetail;
