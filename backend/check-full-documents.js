const pool = require('./config/database');

(async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('=== ALL DRAWINGS WITH DETAILS ===');
    const [allDrawings] = await connection.execute(`
      SELECT d.id, d.name, d.root_card_id, d.status, d.created_at
      FROM drawings d
      ORDER BY d.created_at DESC LIMIT 20
    `);
    console.log(allDrawings);
    
    console.log('\n=== ALL SPECIFICATIONS WITH DETAILS ===');
    const [allSpecs] = await connection.execute(`
      SELECT s.id, s.title, s.root_card_id, s.status, s.created_at
      FROM specifications s
      ORDER BY s.created_at DESC LIMIT 20
    `);
    console.log(allSpecs);
    
    console.log('\n=== DESIGN ENGINEERING DETAILS ===');
    const [designDetails] = await connection.execute(`
      SELECT ded.sales_order_id, ded.design_status, ded.created_at, 
             COUNT(DISTINCT d.id) as drawing_count,
             COUNT(DISTINCT s.id) as spec_count
      FROM design_engineering_details ded
      LEFT JOIN drawings d ON d.root_card_id = ded.sales_order_id
      LEFT JOIN specifications s ON s.root_card_id = ded.sales_order_id
      GROUP BY ded.sales_order_id
      ORDER BY ded.created_at DESC
    `);
    console.log(designDetails);
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
