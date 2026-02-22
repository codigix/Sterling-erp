const pool = require('./config/database');

(async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('=== DRAWINGS ===');
    const [drawings] = await connection.execute(`
      SELECT d.id, d.name, d.root_card_id, rc.title as root_card_title
      FROM drawings d
      LEFT JOIN root_cards rc ON d.root_card_id = rc.id
      ORDER BY d.id DESC LIMIT 10
    `);
    console.log(drawings);
    
    console.log('\n=== SPECIFICATIONS ===');
    const [specs] = await connection.execute(`
      SELECT s.id, s.title, s.root_card_id, rc.title as root_card_title
      FROM specifications s
      LEFT JOIN root_cards rc ON s.root_card_id = rc.id
      ORDER BY s.id DESC LIMIT 10
    `);
    console.log(specs);
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
