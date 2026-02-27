const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

(async () => {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [columns] = await db.execute('DESCRIBE root_card_inventory_tasks');
        console.log('Columns in root_card_inventory_tasks:', columns.map(c => c.Field));

        const [mrs] = await db.execute('SELECT id, mr_number, sales_order_id, status, created_at FROM material_requests ORDER BY id DESC LIMIT 5');
        console.log('Recent Material Requests:', mrs);

        for (const mr of mrs) {
            const [tasks] = await db.execute('SELECT COUNT(*) as count FROM root_card_inventory_tasks WHERE material_request_id = ?', [mr.id]);
            console.log(`MR ${mr.id} (${mr.mr_number}) has ${tasks[0].count} tasks`);
        }

        await db.end();
    } catch (err) {
        console.error(err);
    }
})();
