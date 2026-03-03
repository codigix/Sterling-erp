const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'd:/passion/Sterling-erp/.env' });

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'sterling_erp'
  });
  
  try {
    const [rows] = await conn.execute('DESCRIBE production_plans');
    console.table(rows);
    
    const [rootCards] = await conn.execute('SELECT id, title FROM root_cards LIMIT 5');
    console.log('Root Cards:', rootCards);
    
    const [plans] = await conn.execute('SELECT id, root_card_id, sales_order_id, plan_name FROM production_plans LIMIT 5');
    console.log('Production Plans:', plans);

    const [so] = await conn.execute('SELECT id, project_name FROM sales_orders');
    console.log('Sales Orders:', so);

  } catch (err) {
    console.error(err);
  } finally {
    await conn.end();
  }
})();
