const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sterling_erp'
});

(async () => {
  try {
    const conn = await pool.getConnection();
    
    // Check if it's a numeric ID
    const numericId = parseInt('AD-251223-111939');
    if (!isNaN(numericId)) {
      const [rows] = await conn.execute('SELECT id, code, title FROM root_cards WHERE id = ?', [numericId]);
      if (rows.length > 0) {
        console.log('Found by ID:', rows);
      }
    }
    
    // Try exact match on code
    const [codeRows] = await conn.execute('SELECT id, code, title FROM root_cards WHERE code = ?', ['AD-251223-111939']);
    if (codeRows.length > 0) {
      console.log('Found by code:', codeRows);
    }
    
    // List all root cards
    const [allRows] = await conn.execute('SELECT id, code, title FROM root_cards LIMIT 20');
    console.log('\nAll root cards:');
    allRows.forEach(row => {
      console.log(`ID: ${row.id}, Code: ${row.code}, Title: ${row.title}`);
    });
    
    conn.release();
    await pool.end();
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
