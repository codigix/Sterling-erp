const pool = require('./config/database');

(async () => {
  try {
    const [drawings] = await pool.execute('SELECT id, root_card_id, name, file_path FROM drawings WHERE root_card_id = 13 LIMIT 10');
    console.log('Drawings for root card 13:', JSON.stringify(drawings, null, 2));
    
    const [specs] = await pool.execute('SELECT id, root_card_id, title, file_path FROM specifications WHERE root_card_id = 13 LIMIT 10');
    console.log('\nSpecifications for root card 13:', JSON.stringify(specs, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
})();
