const pool = require('./backend/config/database');

async function checkData() {
  try {
    const [salesOrders] = await pool.execute(`
      SELECT id, po_number, customer, status FROM sales_orders 
      LIMIT 5
    `);
    
    console.log('\n=== SALES ORDERS ===');
    console.log(JSON.stringify(salesOrders, null, 2));
    
    if (salesOrders.length > 0) {
      const soId = salesOrders[0].id;
      
      const [projects] = await pool.execute(`
        SELECT id, name, code, sales_order_id FROM projects 
        WHERE sales_order_id = ?
      `, [soId]);
      
      console.log('\n=== PROJECTS ===');
      console.log(JSON.stringify(projects, null, 2));
      
      if (projects.length > 0) {
        const projectId = projects[0].id;
        
        const [rootCards] = await pool.execute(`
          SELECT id, project_id, sales_order_id, title, code FROM root_cards 
          WHERE project_id = ? OR sales_order_id = ?
        `, [projectId, soId]);
        
        console.log('\n=== ROOT CARDS ===');
        console.log(JSON.stringify(rootCards, null, 2));
      }
      
      const [steps] = await pool.execute(`
        SELECT step_id, step_name, status, assigned_to FROM sales_order_steps 
        WHERE sales_order_id = ?
        ORDER BY step_id ASC
      `, [soId]);
      
      console.log('\n=== SALES ORDER STEPS ===');
      console.log(JSON.stringify(steps, null, 2));
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkData();
