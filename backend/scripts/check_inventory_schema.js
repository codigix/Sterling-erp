const pool = require('../config/database');
(async () => {
  try {
    const [rows] = await pool.execute('DESCRIBE inventory');
    console.table(rows);
  } catch(err) {
    console.error('Error:', err.message);
  } finally {
    process.exit();
  }
})();