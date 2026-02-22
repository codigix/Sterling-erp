const pool = require('./config/database');

(async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('=== ROOT CARDS TABLE ===');
    const [rootCards] = await connection.execute(`
      SELECT id, sales_order_id, title, code
      FROM root_cards
      ORDER BY id DESC LIMIT 10
    `);
    console.log(rootCards);
    
    console.log('\n=== SALES_ORDERS TABLE ===');
    const [salesOrders] = await connection.execute(`
      SELECT id, po_number, project_name
      FROM sales_orders
      ORDER BY id DESC LIMIT 10
    `);
    console.log(salesOrders);
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
