const pool = require('../config/database');

class ShipmentDetail {
  static async createTable() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS shipment_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL UNIQUE,
        
        delivery_schedule VARCHAR(500),
        packaging_info VARCHAR(500),
        dispatch_mode VARCHAR(255),
        installation_required VARCHAR(500),
        site_commissioning VARCHAR(500),
        
        marking VARCHAR(500),
        dismantling VARCHAR(500),
        packing VARCHAR(500),
        dispatch VARCHAR(500),
        
        shipment_method VARCHAR(100),
        carrier_name VARCHAR(255),
        tracking_number VARCHAR(100),
        estimated_delivery_date DATE,
        shipping_address TEXT,
        shipment_date TIMESTAMP NULL,
        shipment_status ENUM('pending', 'prepared', 'dispatched', 'in_transit', 'delivered') DEFAULT 'pending',
        shipment_cost DECIMAL(12,2),
        notes TEXT,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        INDEX idx_sales_order (sales_order_id),
        INDEX idx_shipment_status (shipment_status)
      )
    `);
  }

  static async findBySalesOrderId(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT * FROM shipment_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO shipment_details 
       (sales_order_id, delivery_schedule, packaging_info, dispatch_mode, installation_required,
        site_commissioning, marking, dismantling, packing, dispatch,
        shipment_method, carrier_name, tracking_number, estimated_delivery_date,
        shipping_address, shipment_date, shipment_status, shipment_cost, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.salesOrderId,
        data.deliveryTerms?.deliverySchedule || null,
        data.deliveryTerms?.packagingInfo || null,
        data.deliveryTerms?.dispatchMode || null,
        data.deliveryTerms?.installationRequired || null,
        data.deliveryTerms?.siteCommissioning || null,
        data.shipment?.marking || null,
        data.shipment?.dismantling || null,
        data.shipment?.packing || null,
        data.shipment?.dispatch || null,
        data.shipmentMethod || null,
        data.carrierName || null,
        data.trackingNumber || null,
        data.estimatedDeliveryDate || null,
        data.shippingAddress || null,
        data.shipmentDate || null,
        data.shipmentStatus || 'pending',
        data.shipmentCost || null,
        data.notes || null
      ]
    );
    return result.insertId;
  }

  static async update(salesOrderId, data) {
    await pool.execute(
      `UPDATE shipment_details 
       SET delivery_schedule = ?, packaging_info = ?, dispatch_mode = ?, installation_required = ?,
           site_commissioning = ?, marking = ?, dismantling = ?, packing = ?, dispatch = ?,
           shipment_method = ?, carrier_name = ?, tracking_number = ?, 
           estimated_delivery_date = ?, shipping_address = ?, shipment_date = ?,
           shipment_status = ?, shipment_cost = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        data.deliveryTerms?.deliverySchedule || null,
        data.deliveryTerms?.packagingInfo || null,
        data.deliveryTerms?.dispatchMode || null,
        data.deliveryTerms?.installationRequired || null,
        data.deliveryTerms?.siteCommissioning || null,
        data.shipment?.marking || null,
        data.shipment?.dismantling || null,
        data.shipment?.packing || null,
        data.shipment?.dispatch || null,
        data.shipmentMethod || null,
        data.carrierName || null,
        data.trackingNumber || null,
        data.estimatedDeliveryDate || null,
        data.shippingAddress || null,
        data.shipmentDate || null,
        data.shipmentStatus || 'pending',
        data.shipmentCost || null,
        data.notes || null,
        salesOrderId
      ]
    );
  }

  static async updateShipmentStatus(salesOrderId, status) {
    const updateData = {
      shipment_status: status,
      updated_at: new Date()
    };

    if (status === 'dispatched') {
      updateData.shipment_date = new Date();
    }

    await pool.execute(
      `UPDATE shipment_details 
       SET shipment_status = ?, shipment_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [status, status === 'dispatched' ? new Date() : null, salesOrderId]
    );
  }

  static async updateDeliveryTerms(salesOrderId, deliveryTerms) {
    await pool.execute(
      `UPDATE shipment_details 
       SET delivery_schedule = ?, packaging_info = ?, dispatch_mode = ?, 
           installation_required = ?, site_commissioning = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        deliveryTerms.deliverySchedule || null,
        deliveryTerms.packagingInfo || null,
        deliveryTerms.dispatchMode || null,
        deliveryTerms.installationRequired || null,
        deliveryTerms.siteCommissioning || null,
        salesOrderId
      ]
    );
  }

  static async updateShipmentProcess(salesOrderId, shipment) {
    await pool.execute(
      `UPDATE shipment_details 
       SET marking = ?, dismantling = ?, packing = ?, dispatch = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        shipment.marking || null,
        shipment.dismantling || null,
        shipment.packing || null,
        shipment.dispatch || null,
        salesOrderId
      ]
    );
  }

  static async updateShippingDetails(salesOrderId, shippingData) {
    await pool.execute(
      `UPDATE shipment_details 
       SET shipment_method = ?, carrier_name = ?, tracking_number = ?, 
           estimated_delivery_date = ?, shipping_address = ?, shipment_cost = ?, 
           notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        shippingData.shipmentMethod || null,
        shippingData.carrierName || null,
        shippingData.trackingNumber || null,
        shippingData.estimatedDeliveryDate || null,
        shippingData.shippingAddress || null,
        shippingData.shipmentCost || null,
        shippingData.notes || null,
        salesOrderId
      ]
    );
  }

  static async validateShipment(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT delivery_schedule, packaging_info, dispatch_mode, marking, packing, dispatch,
              shipment_method, carrier_name, estimated_delivery_date, shipping_address
       FROM shipment_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );

    if (!rows || rows.length === 0) {
      return { isValid: false, errors: ['Shipment details not found'] };
    }

    const row = rows[0];
    const errors = [];
    const warnings = [];

    if (!row.delivery_schedule) warnings.push('Delivery schedule not set');
    if (!row.packaging_info) warnings.push('Packaging information not provided');
    if (!row.dispatch_mode) warnings.push('Dispatch mode not selected');
    if (!row.marking) warnings.push('Marking information missing');
    if (!row.packing) warnings.push('Packing information missing');
    if (!row.shipment_method) errors.push('Shipment method is required');
    if (!row.shipping_address) errors.push('Shipping address is required');
    if (!row.carrier_name && row.shipment_method) warnings.push('Carrier name should be specified');
    if (!row.estimated_delivery_date) warnings.push('Estimated delivery date not set');

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
      salesOrderId: row.sales_order_id,
      deliveryTerms: {
        deliverySchedule: row.delivery_schedule,
        packagingInfo: row.packaging_info,
        dispatchMode: row.dispatch_mode,
        installationRequired: row.installation_required,
        siteCommissioning: row.site_commissioning
      },
      shipment: {
        marking: row.marking,
        dismantling: row.dismantling,
        packing: row.packing,
        dispatch: row.dispatch
      },
      shipmentMethod: row.shipment_method,
      carrierName: row.carrier_name,
      trackingNumber: row.tracking_number,
      estimatedDeliveryDate: row.estimated_delivery_date,
      shippingAddress: row.shipping_address,
      shipmentDate: row.shipment_date,
      shipmentStatus: row.shipment_status,
      shipmentCost: row.shipment_cost,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = ShipmentDetail;
