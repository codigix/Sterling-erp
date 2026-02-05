const mysql = require('mysql2/promise');
require('dotenv').config();

async function queryPlans() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await connection.execute('SELECT id, plan_name FROM production_plans ORDER BY id DESC LIMIT 10');
        console.log(rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

queryPlans();
