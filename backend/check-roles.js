require('dotenv').config();
const pool = require('./config/database');

(async () => {
  try {
    const [roles] = await pool.execute('SELECT id, name FROM roles ORDER BY id');
    console.log('Roles in database:');
    roles.forEach(r => console.log(`  ${r.id}: ${r.name}`));
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
