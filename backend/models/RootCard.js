const pool = require('../config/database');

const parseJson = (value, fallback = []) => {
  if (!value) {
    return fallback;
  }
  if (typeof value === 'object') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
};

class RootCard {
  static formatRow(row) {
    if (!row) {
      return null;
    }
    return {
      ...row,
      rootCardId: row.id,
      sales_order_id: row.id,
      items: parseJson(row.items),
      documents: parseJson(row.documents),
      project_scope: parseJson(row.project_scope, null)
    };
  }

  static async findAll(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.status && filters.status !== 'all') {
      conditions.push('so.status = ?');
      params.push(filters.status);
    }

    if (filters.search) {
      conditions.push('(so.customer LIKE ? OR so.po_number LIKE ? OR so.project_name LIKE ? OR so.notes LIKE ?)');
      const like = `%${filters.search}%`;
      params.push(like, like, like, like);
    }

    if (filters.hasMaterialRequests === true || filters.hasMaterialRequests === 'true') {
      conditions.push(`EXISTS (
        SELECT 1 FROM material_requests mr 
        WHERE mr.sales_order_id = so.id OR mr.root_card_id = so.id
      )`);
    }

    if (filters.assignedOnly === true || filters.assignedOnly === 'true') {
      if (filters.userId) {
        // Find orders where:
        // 1. Explicitly assigned to this user
        // 2. Assigned to a department where this user belongs (based on their role)
        // 3. User is assigned to a specific step in that root card
        // Use more flexible role matching (Design Engineer, design_engineer, design.engineer)
        conditions.push(`(
          so.assigned_to = ? 
          OR EXISTS (
            SELECT 1 FROM root_cards_departments rcd
            JOIN users u ON u.id = ?
            JOIN roles r ON u.role_id = r.id
            WHERE rcd.root_card_id = so.id 
            AND (
              (rcd.department LIKE '%Design Engineering%' AND (r.name LIKE '%Design Engineer%' OR r.name LIKE '%design_engineer%' OR r.name LIKE '%design.engineer%'))
              OR (rcd.department LIKE '%Inventory%' AND (r.name LIKE '%Inventory%' OR r.name LIKE '%inventory%' OR r.name LIKE '%inventory_manager%'))
              OR (rcd.department LIKE '%Production%' AND (r.name LIKE '%Production%' OR r.name LIKE '%production%' OR r.name LIKE '%production_manager%'))
            )
          )
          OR EXISTS (
            SELECT 1 FROM sales_order_steps sos
            WHERE sos.sales_order_id = so.id AND sos.assigned_to = ?
          )
          OR EXISTS (
            SELECT 1 FROM sales_orders_management som
            JOIN users u ON u.id = ?
            JOIN roles r ON u.role_id = r.id
            WHERE som.root_card_id = so.id 
            AND som.status = 'Sent to Production'
            AND (r.name LIKE '%Production%' OR r.name LIKE '%production%' OR r.name LIKE '%production_manager%')
          )
        )`);
        params.push(filters.userId, filters.userId, filters.userId, filters.userId);
      } else {
        conditions.push('so.assigned_to IS NOT NULL');
      }
    }

    let query = `
      SELECT so.*, p.id as project_id, p.code as project_code 
      FROM sales_orders so
      LEFT JOIN projects p ON p.sales_order_id = so.id
    `;

    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY so.created_at DESC';

    const [rows] = await pool.execute(query, params);
    const formattedCards = rows.map(RootCard.formatRow);
    
    const includeSteps = filters.includeSteps !== false;
    if (includeSteps && formattedCards.length > 0) {
      return await RootCard.enrichRootCardsBulk(formattedCards);
    }
    return formattedCards;
  }

  static async enrichRootCardsBulk(rootCards) {
    const rootCardIds = rootCards.map(rc => rc.id);
    const tables = [
      { key: 'step1_clientPO', name: 'client_po_details' },
      { key: 'step2_design', name: 'design_engineering_details' },
      { key: 'step3_materials', name: 'material_requirements_details' },
      { key: 'step4_production', name: 'production_plan_details' },
      { key: 'step5_quality', name: 'quality_check_details' },
      { key: 'step6_shipment', name: 'shipment_details' },
      { key: 'step7_delivery', name: 'delivery_details' }
    ];

    const stepsMap = {};
    rootCardIds.forEach(id => {
      stepsMap[id] = {
        step1_clientPO: null,
        step2_design: null,
        step3_materials: null,
        step4_production: null,
        step5_quality: null,
        step6_shipment: null,
        step7_delivery: null
      };
    });

    for (const table of tables) {
      try {
        const [rows] = await pool.execute(
          `SELECT * FROM ${table.name} WHERE sales_order_id IN (${rootCardIds.map(() => '?').join(',')})`,
          rootCardIds
        );
        rows.forEach(row => {
          if (stepsMap[row.sales_order_id]) {
            stepsMap[row.sales_order_id][table.key] = RootCard.parseStepData(row);
          }
        });
      } catch (error) {
        console.warn(`Table ${table.name} not available in bulk fetch:`, error.message);
      }
    }

    return rootCards.map(rc => ({
      ...rc,
      steps: stepsMap[rc.id]
    }));
  }

  static async findById(id) {
    const [rows] = await pool.execute(`
      SELECT so.*, p.id as project_id, p.code as project_code 
      FROM sales_orders so
      LEFT JOIN projects p ON p.sales_order_id = so.id
      WHERE so.id = ?
    `, [id]);
    const rootCard = RootCard.formatRow(rows[0]);
    if (!rootCard) return null;
    return RootCard.enrichRootCardWithSteps(rootCard);
  }

  static async enrichRootCardWithSteps(rootCard) {
    const steps = {
      step1_clientPO: null,
      step2_design: null,
      step3_materials: null,
      step4_production: null,
      step5_quality: null,
      step6_shipment: null,
      step7_delivery: null
    };

    const tables = [
      { key: 'step1_clientPO', name: 'client_po_details' },
      { key: 'step2_design', name: 'design_engineering_details' },
      { key: 'step3_materials', name: 'material_requirements_details' },
      { key: 'step4_production', name: 'production_plan_details' },
      { key: 'step5_quality', name: 'quality_check_details' },
      { key: 'step6_shipment', name: 'shipment_details' },
      { key: 'step7_delivery', name: 'delivery_details' }
    ];

    for (const table of tables) {
      try {
        const [rows] = await pool.execute(
          `SELECT * FROM ${table.name} WHERE sales_order_id = ?`,
          [rootCard.id]
        );
        if (rows && rows.length > 0) {
          steps[table.key] = RootCard.parseStepData(rows[0]);
        }
      } catch (error) {
        console.warn(`Table ${table.name} not available`);
      }
    }

    return {
      ...rootCard,
      steps
    };
  }

  static parseStepData(row) {
    if (!row) return null;
    const parsed = { ...row };
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string') {
        try {
          parsed[key] = JSON.parse(value);
        } catch (e) {
          // Keep as string if not JSON
        }
      }
    }
    return parsed;
  }

  static async getStats() {
    const [rows] = await pool.execute(`
      SELECT
        COUNT(*) AS total_cards,
        COALESCE(SUM(total), 0) AS total_value,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_cards,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_cards,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_cards,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered_cards
      FROM sales_orders
    `);
    return rows[0];
  }

  static async create(data, externalConnection = null) {
    const connection = externalConnection || (await pool.getConnection());

    try {
      const projectNameValue = (data.projectName && data.projectName.trim()) ? data.projectName : `${data.customer}-${data.poNumber}`;
      const projectScopeValue = (data.projectScope && Object.values(data.projectScope).some(v => v)) ? data.projectScope : { application: '', dimensions: '', specifications: '' };

      const [result] = await connection.execute(
        `
          INSERT INTO sales_orders
          (customer, po_number, order_date, due_date, total, currency, status, priority, items, documents, notes, project_scope, project_name, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.customer,
          data.poNumber,
          data.orderDate,
          data.dueDate || null,
          data.total,
          data.currency || 'INR',
          data.status || 'pending',
          data.priority || 'medium',
          JSON.stringify(data.items || []),
          data.documents ? JSON.stringify(data.documents) : null,
          data.notes || null,
          JSON.stringify(projectScopeValue),
          projectNameValue,
          data.createdBy || null
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

  static async update(id, data) {
    const updates = {};

    if (data.customer !== undefined && data.customer !== null) updates.customer = data.customer;
    if (data.poNumber !== undefined && data.poNumber !== null) updates.po_number = data.poNumber;
    if (data.orderDate !== undefined && data.orderDate !== null) updates.order_date = data.orderDate;
    if (data.dueDate !== undefined) updates.due_date = data.dueDate || null;
    if (data.total !== undefined && data.total !== null) updates.total = data.total;
    if (data.currency !== undefined) updates.currency = data.currency || 'INR';
    if (data.status !== undefined && data.status !== null) updates.status = data.status;
    if (data.priority !== undefined) updates.priority = data.priority || 'medium';
    if (data.items !== undefined) updates.items = JSON.stringify(data.items || []);
    if (data.documents !== undefined) updates.documents = data.documents ? JSON.stringify(data.documents) : null;
    if (data.notes !== undefined) updates.notes = data.notes || null;
    if (data.projectScope !== undefined && data.projectScope !== null) {
      const projectScopeValue = (data.projectScope && Object.values(data.projectScope).some(v => v)) ? data.projectScope : { application: '', dimensions: '', specifications: '' };
      updates.project_scope = JSON.stringify(projectScopeValue);
    }
    if (data.projectName !== undefined && data.projectName !== null) updates.project_name = data.projectName;

    updates.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);

    await pool.execute(
      `UPDATE sales_orders SET ${setClause} WHERE id = ?`,
      values
    );
  }

  static async updateStatus(id, status) {
    await pool.execute('UPDATE sales_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
  }
}

module.exports = RootCard;
