
const pool = require('./backend/config/database');
// require('dotenv').config();

async function check() {
    try {
        const [users] = await pool.execute('SELECT id, username, email FROM users');
        console.log('All Users:', JSON.stringify(users, null, 2));
        
        const [emp] = await pool.execute('SELECT id, first_name, last_name, email FROM employees WHERE id = 21');
        console.log('Employee 21:', JSON.stringify(emp, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
check();
