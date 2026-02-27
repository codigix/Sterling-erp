const pool = require('./backend/config/database');
(async () => {
  try {
    const [result] = await pool.execute('DELETE FROM root_card_inventory_tasks WHERE root_card_id NOT IN (SELECT DISTINCT sales_order_id FROM material_requests)');
    console.log(`Cleaned up ${result.affectedRows} tasks from root_card_inventory_tasks`);
    
    const [result2] = await pool.execute(`
      DELETE FROM department_tasks 
      WHERE role_id IN (SELECT id FROM roles WHERE name IN ('Inventory', 'inventory', 'inventory_manager', 'Inventory Manager'))
      AND root_card_id NOT IN (SELECT DISTINCT sales_order_id FROM material_requests)
      AND JSON_EXTRACT(notes, '$.workflow_type') = 'inventory'
    `);
    console.log(`Cleaned up ${result2.affectedRows} tasks from department_tasks`);
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();