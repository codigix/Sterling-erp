const pool = require('../config/database');

(async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('=== GRN Table Info ===');
    const grnCount = await conn.query('SELECT COUNT(*) as count FROM grn');
    console.log('GRN count:', grnCount[0][0].count);
    
    console.log('\n=== Goods Receipt Notes Table Info ===');
    const grnNotesCount = await conn.query('SELECT COUNT(*) as count FROM goods_receipt_notes');
    console.log('Goods Receipt Notes count:', grnNotesCount[0][0].count);
    
    console.log('\n=== Goods Receipt Notes Schema ===');
    const grnNotesSchema = await conn.query('DESCRIBE goods_receipt_notes');
    grnNotesSchema[0].forEach(row => {
      console.log(`${row.Field} (${row.Type}) - Null: ${row.Null}, Default: ${row.Default}`);
    });
    
  } catch(err) {
    console.error('Error:', err.message);
  } finally {
    if(conn) conn.release();
    process.exit();
  }
})();
