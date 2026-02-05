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
    console.log('Cleaning up orphan production plans...');
    
    // Delete plans referencing non-existent root cards
    const [ppResult] = await connection.execute(`
      DELETE FROM production_plans 
      WHERE root_card_id IS NOT NULL 
      AND root_card_id NOT IN (SELECT id FROM root_cards)
    `);
    console.log(`Deleted ${ppResult.affectedRows} orphan production plans.`);

    // Delete details referencing non-existent SOs AND non-existent Root Cards
    // (since some root card IDs were stored in sales_order_id)
    const [ppdResult] = await connection.execute(`
      DELETE FROM production_plan_details 
      WHERE sales_order_id IS NOT NULL 
      AND sales_order_id NOT IN (SELECT id FROM sales_orders)
      AND sales_order_id NOT IN (SELECT id FROM root_cards)
    `);
    console.log(`Deleted ${ppdResult.affectedRows} orphan production plan details.`);

    console.log('Cleanup done.');
  } catch (error) {
    console.error('Cleanup failed:', error.message);
  } finally {
    await connection.end();
  }
}

main();
