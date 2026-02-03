const mysql = require('mysql2/promise');
const config = {
  host: 'localhost',
  user: 'root',
  password: 'Kale@1234',
  database: 'sterling_erp'
};

async function main() {
  const connection = await mysql.createConnection(config);
  try {
    const [rows] = await connection.execute('DESCRIBE manufacturing_stages');
    console.table(rows);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

main();
