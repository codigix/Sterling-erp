const mysql = require('mysql2/promise');
require('dotenv').config();

async function inspectTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const tableName = process.argv[2];
        if (!tableName) {
            console.error('Please provide a table name');
            return;
        }
        const [rows] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log(rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

inspectTable();
