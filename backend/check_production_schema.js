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
    console.log('--- production_plans ---');
    const [pp] = await connection.execute('DESCRIBE production_plans');
    console.table(pp);
    
    console.log('--- production_plan_details ---');
    const [ppd] = await connection.execute('DESCRIBE production_plan_details');
    console.table(ppd);

    console.log('--- work_orders ---');
    const [wo] = await connection.execute('DESCRIBE work_orders');
    console.table(wo);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

main();
