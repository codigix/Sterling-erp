const pool = require('./config/database');

(async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('=== ROOT CARDS (sales_orders) ===');
    const [rootCards] = await connection.execute(`
      SELECT id, po_number, project_name, created_at
      FROM sales_orders
      ORDER BY id DESC LIMIT 10
    `);
    console.log(rootCards);
    
    console.log('\n=== DESIGN ENGINEERING DETAILS ===');
    const [designs] = await connection.execute(`
      SELECT sales_order_id, design_status, created_at
      FROM design_engineering_details
      LIMIT 10
    `);
    console.log(designs);
    
    console.log('\n=== DRAWINGS ===');
    const [drawings] = await connection.execute(`
      SELECT id, root_card_id, name, status
      FROM drawings
      LIMIT 10
    `);
    console.log(drawings);
    
    console.log('\n=== SPECIFICATIONS ===');
    const [specs] = await connection.execute(`
      SELECT id, root_card_id, title, status
      FROM specifications
      LIMIT 10
    `);
    console.log(specs);
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
