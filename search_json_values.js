const pool = require('./backend/config/database');

async function searchJSONValues() {
  try {
    const [tables] = await pool.execute('SHOW TABLES');
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      const [rows] = await pool.execute(`SELECT * FROM ${tableName}`);
      
      for (const row of rows) {
        // Recursive function to search for value "handle" in objects
        function searchObj(obj, path = '') {
          if (!obj) return;
          if (typeof obj === 'string') {
            if (obj.trim().toLowerCase() === 'handle') {
              console.log(`Match in ${tableName} at ${path}: "${obj}"`);
              console.log(`  Row ID: ${row.id || 'N/A'}`);
            }
            return;
          }
          if (typeof obj === 'object') {
            for (const key in obj) {
              try {
                let val = obj[key];
                if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
                  try {
                    val = JSON.parse(val);
                  } catch (e) {}
                }
                searchObj(val, `${path}.${key}`);
              } catch (e) {}
            }
          }
        }
        searchObj(row);
      }
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

searchJSONValues();
