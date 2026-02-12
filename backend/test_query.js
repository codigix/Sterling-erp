const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, './.env') });

(async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'sterling_erp'
    });
    const roleId = 5;
    const query = `SELECT 
                    dt.*,
                    rc.title as root_card_title,
                    rc.priority as root_card_priority,
                    rc.code as root_card_code,
                    rc.project_id,
                    p.name as project_name,
                    p.code as project_code,
                    COALESCE(dt.sales_order_id, rc.sales_order_id, p.sales_order_id) as sales_order_id,
                    so.po_number,
                    so.customer,
                    so.total,
                    so.order_date,
                    so.due_date,
                    r.name as role_name,
                    u.username as assigned_by_name,
                    sod.product_details
                 FROM department_tasks dt
                 LEFT JOIN root_cards rc ON dt.root_card_id = rc.id
                 LEFT JOIN projects p ON rc.project_id = p.id
                 LEFT JOIN sales_orders so ON COALESCE(dt.sales_order_id, rc.sales_order_id, p.sales_order_id) = so.id
                 LEFT JOIN sales_order_details sod ON sod.id = (
                    SELECT id FROM sales_order_details 
                    WHERE sales_order_id = so.id 
                    LIMIT 1
                 )
                 LEFT JOIN roles r ON dt.role_id = r.id
                 LEFT JOIN users u ON dt.assigned_by = u.id
                 WHERE dt.role_id = ?`;
    const [rows] = await pool.execute(query, [roleId]);
    console.log(`Found ${rows.length} tasks for role 5`);
    console.log(JSON.stringify(rows, null, 2));
    await pool.end();
  } catch (e) {
    console.error(e);
  }
})();
