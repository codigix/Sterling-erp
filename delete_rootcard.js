const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root@12345',
  database: 'sterling_erp'
});

(async () => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute('SELECT id FROM root_cards WHERE code = ?', ['AD-251223-111939']);
    
    if (rows.length > 0) {
      const id = rows[0].id;
      console.log(`Found root card with ID: ${id}`);
      
      await conn.beginTransaction();
      
      // Delete department tasks
      await conn.execute('DELETE FROM department_tasks WHERE root_card_id = ?', [id]);
      console.log('Deleted department tasks');
      
      // Delete worker tasks
      await conn.execute('DELETE FROM worker_tasks WHERE stage_id IN (SELECT id FROM manufacturing_stages WHERE root_card_id = ?)', [id]);
      console.log('Deleted worker tasks');
      
      // Delete manufacturing stages
      await conn.execute('DELETE FROM manufacturing_stages WHERE root_card_id = ?', [id]);
      console.log('Deleted manufacturing stages');
      
      // Delete root card
      await conn.execute('DELETE FROM root_cards WHERE id = ?', [id]);
      console.log('Deleted root card');
      
      await conn.commit();
      console.log(`✓ Successfully deleted root card "AD-251223-111939" (ID: ${id}) and all associated tasks from database`);
    } else {
      console.log('✗ Root card with code "AD-251223-111939" not found in database');
    }
    
    conn.release();
    await pool.end();
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
