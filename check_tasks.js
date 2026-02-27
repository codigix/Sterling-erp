const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [mr] = await db.execute('SELECT id FROM material_requests WHERE id = 19 OR id = (SELECT id FROM material_requests ORDER BY id DESC LIMIT 1)');
        console.log('Material Request Found:', mr);

        if (mr.length > 0) {
            const mrId = mr[0].id;
            const [tasks] = await db.execute('SELECT * FROM root_card_inventory_tasks WHERE material_request_id = ?', [mrId]);
            console.log(`Tasks for MR ${mrId}:`, tasks.length);
            console.log(JSON.stringify(tasks, null, 2));
        }

        await db.end();
    } catch (err) {
        console.error(err);
    }
})();
