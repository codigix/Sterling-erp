const pool = require("../config/database");
const RootCardInventoryTask = require("./RootCardInventoryTask");
const parseJson = (value, fallback = []) => {
  if (!value) {
    return fallback;
  }
  if (typeof value === "object") {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
};

class ProductionRootCard {
  static formatRow(row) {
    if (!row) {
      return null;
    }
    return {
      ...row,
      stages: parseJson(row.stages, []),
      product_details: row.product_details ? parseJson(row.product_details, null) : null,
      design_details: row.design_specifications ? parseJson(row.design_specifications, null) : null,
      design_documents: parseJson(row.design_documents, []),
      design_bom_data: parseJson(row.design_bom_data, []),
      design_status: row.design_status || 'draft',
      sales_order_items: row.sales_order_items ? parseJson(row.sales_order_items, []) : [],
      root_card_items: row.sales_order_items ? parseJson(row.sales_order_items, []) : [],
      product_name: row.product_details ? parseJson(row.product_details).itemName : null,
      root_card_id: row.id,
      sales_order_id: row.sales_order_id,
      project: row.project_id
        ? {
            id: row.project_id,
            name: row.project_name,
            code: row.project_code,
            clientName: row.client_name,
          }
        : null,
      rootCardDetails: row.sales_order_id ? {
        id: row.sales_order_id,
        customer: row.customer_name,
        poNumber: row.po_number,
        orderDate: row.order_date,
        dueDate: row.due_date,
        total: row.total,
        currency: row.currency,
        status: row.so_status,
        items: parseJson(row.sales_order_items, [])
      } : null
    };
  }

  static async findAll(filters = {}) {
    const params = [];
    const conditions = [];
    let query = `
      SELECT rc.*, 
             p.name AS project_name, 
             p.code AS project_code, 
             p.client_name,
             p.sales_order_id,
             so.customer AS customer_name,
             so.po_number,
             so.order_date,
             so.due_date,
             so.total,
             so.currency,
             so.status AS so_status,
             so.items AS sales_order_items,
             ded.specifications AS design_specifications,
             ded.documents AS design_documents,
             ded.bom_data AS design_bom_data,
             ded.design_status,
             sod.product_details,
             u.username AS assigned_supervisor_name
      FROM root_cards rc
      LEFT JOIN projects p ON p.id = rc.project_id
      LEFT JOIN sales_orders so ON so.id = COALESCE(rc.sales_order_id, p.sales_order_id)
      LEFT JOIN sales_orders_management som ON som.root_card_id = so.id
      LEFT JOIN design_engineering_details ded ON ded.sales_order_id = so.id
      LEFT JOIN sales_order_details sod ON sod.sales_order_id = so.id
      LEFT JOIN users u ON u.id = rc.assigned_supervisor
    `;

    if (filters.assignedTo) {
      query += `
        INNER JOIN manufacturing_stages ms_filter ON ms_filter.root_card_id = rc.id AND ms_filter.assigned_worker = ?
      `;
      params.push(filters.assignedTo);
    }

    if (filters.status && filters.status !== "all") {
      conditions.push("rc.status = ?");
      params.push(filters.status);
    }

    if (filters.projectId) {
      conditions.push("rc.project_id = ?");
      params.push(filters.projectId);
    }

    if (filters.search) {
      conditions.push("(rc.title LIKE ? OR p.name LIKE ? OR rc.code LIKE ?)");
      const like = `%${filters.search}%`;
      params.push(like, like, like);
    }

    if (conditions.length) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY rc.created_at DESC";

    const [rows] = await pool.execute(query, params);
    return rows.map(ProductionRootCard.formatRow);
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `
        SELECT rc.*, 
               p.name AS project_name, 
               p.code AS project_code, 
               p.client_name,
               p.sales_order_id,
               so.customer AS customer_name,
               so.po_number,
               so.order_date,
               so.due_date,
               so.total,
               so.currency,
               so.status AS so_status,
               so.items AS sales_order_items,
               ded.specifications AS design_specifications,
               ded.documents AS design_documents,
               ded.bom_data AS design_bom_data,
               ded.design_status,
               sod.product_details,
               u.username AS assigned_supervisor_name
        FROM root_cards rc
        LEFT JOIN projects p ON p.id = rc.project_id
        LEFT JOIN sales_orders so ON so.id = COALESCE(rc.sales_order_id, p.sales_order_id)
        LEFT JOIN sales_orders_management som ON som.root_card_id = so.id
        LEFT JOIN design_engineering_details ded ON ded.sales_order_id = so.id
        LEFT JOIN sales_order_details sod ON sod.sales_order_id = so.id
        LEFT JOIN users u ON u.id = rc.assigned_supervisor
        WHERE rc.id = ?
      `,
      [id]
    );
    return ProductionRootCard.formatRow(rows[0]);
  }

  static async findBySalesOrderId(salesOrderId) {
    const [rows] = await pool.execute(
      `
        SELECT rc.*, 
               p.name AS project_name, 
               p.code AS project_code, 
               p.client_name,
               p.sales_order_id,
               so.customer AS customer_name,
               so.po_number,
               so.order_date,
               so.due_date,
               so.total,
               so.currency,
               so.status AS so_status,
               so.items AS sales_order_items,
               ded.specifications AS design_specifications,
               ded.documents AS design_documents,
               ded.bom_data AS design_bom_data,
               ded.design_status,
               sod.product_details,
               u.username AS assigned_supervisor_name
        FROM root_cards rc
        LEFT JOIN projects p ON p.id = rc.project_id
        LEFT JOIN sales_orders so ON so.id = COALESCE(rc.sales_order_id, p.sales_order_id)
        LEFT JOIN sales_orders_management som ON som.root_card_id = so.id
        LEFT JOIN design_engineering_details ded ON ded.sales_order_id = so.id
        LEFT JOIN sales_order_details sod ON sod.sales_order_id = so.id
        LEFT JOIN users u ON u.id = rc.assigned_supervisor
        WHERE so.id = ?
      `,
      [salesOrderId]
    );
    return ProductionRootCard.formatRow(rows[0]);
  }

  static async findByRootCardId(rootCardId) {
    return this.findById(rootCardId);
  }

  static async create(data, externalConnection = null) {
    const connection = externalConnection || (await pool.getConnection());

    try {
      const [result] = await connection.execute(
        `
          INSERT INTO root_cards
          (project_id, sales_order_id, code, title, status, priority, planned_start, planned_end, created_by, assigned_supervisor, notes, stages, parent_root_card_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.projectId,
          data.rootCardId || null,
          data.code || null,
          data.title,
          data.status || "planning",
          data.priority || "medium",
          data.plannedStart || null,
          data.plannedEnd || null,
          data.createdBy || null,
          data.assignedSupervisor || null,
          data.notes || null,
          JSON.stringify(data.stages || []),
          data.parentRootCardId || null,
        ]
      );

      const productionRootCardId = result.insertId;

      if (!externalConnection) {
        connection.release();
      }

      return productionRootCardId;
    } catch (error) {
      if (!externalConnection) {
        connection.release();
      }
      throw error;
    }
  }
}

module.exports = ProductionRootCard;
