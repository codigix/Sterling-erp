
const pool = require('./backend/config/database');
require('dotenv').config();

async function check() {
    try {
        const [emp21] = await pool.execute('SELECT id, user_id, first_name, last_name FROM employees WHERE id = 21');
        console.log('Employee 21:', emp21);
        
        const [empForUser18] = await pool.execute('SELECT id, user_id, first_name, last_name FROM employees WHERE user_id = 18');
        console.log('Employee for User 18:', empForUser18);
        
        const [user18] = await pool.execute('SELECT id, username, role FROM users WHERE id = 18');
        console.log('User 18:', user18);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
check();
