const pool = require('./backend/config/database');

async function searchHandleSQL() {
  try {
    const [tables] = await pool.execute('SHOW TABLES');
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      const [columns] = await pool.execute(`SHOW COLUMNS FROM ${tableName}`);
      
      for (const column of columns) {
        const columnName = column.Field;
        const type = column.Type.toLowerCase();
        
        if (type.includes('char') || type.includes('text') || type.includes('json')) {
          const [matches] = await pool.execute(`SELECT * FROM ${tableName} WHERE \`${columnName}\` LIKE '%handle%'`);
          if (matches.length > 0) {
            console.log(`Match in ${tableName}.${columnName}:`);
            matches.forEach(m => console.log(`  ID ${m.id || 'N/A'}: ${JSON.stringify(m[columnName])}`));
          }
        }
      }
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

searchHandleSQL();
