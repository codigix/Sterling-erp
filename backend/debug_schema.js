const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Kale@1234',
      database: 'sterling_erp'
    });
    try {
      const [bmDesc] = await conn.execute('DESCRIBE bom_materials');
      console.log('--- bom_materials schema ---');
      console.table(bmDesc.map(c => ({ Field: c.Field, Type: c.Type })));

      const [woDesc] = await conn.execute('DESCRIBE work_orders');
      console.log('--- work_orders schema ---');
      console.table(woDesc.map(c => ({ Field: c.Field, Type: c.Type })));

      const [woOpDesc] = await conn.execute('DESCRIBE work_order_operations');
      console.log('--- work_order_operations schema ---');
      console.table(woOpDesc.map(c => ({ Field: c.Field, Type: c.Type })));

      const [woInvDesc] = await conn.execute('DESCRIBE work_order_inventory');
      console.log('--- work_order_inventory schema ---');
      console.table(woInvDesc.map(c => ({ Field: c.Field, Type: c.Type })));
    } finally {
      await conn.end();
    }
  } catch (e) {
    console.error(e);
  }
})();
