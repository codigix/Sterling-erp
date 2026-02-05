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
    const [pp] = await connection.execute('SELECT id, sales_order_id, root_card_id, plan_name FROM production_plans');
    console.table(pp);
    
    console.log('--- production_plan_details ---');
    const [ppd] = await connection.execute('SELECT id, sales_order_id, root_card_id FROM production_plan_details');
    console.table(ppd);

    console.log('--- root_cards ---');
    const [rc] = await connection.execute('SELECT id, code FROM root_cards');
    console.table(rc);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

main();
