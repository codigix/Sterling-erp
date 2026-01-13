const pool = require('./backend/config/database');
async function checkData() {
  const [rows] = await pool.execute('SELECT project_requirements FROM client_po_details LIMIT 5');
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}
checkData();
