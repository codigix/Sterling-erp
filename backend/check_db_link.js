const pool = require('./config/database');
(async () => {
    try {
        const [employees] = await pool.execute('SELECT id, first_name, last_name, email FROM employees LIMIT 10');
        console.log('Employees:', JSON.stringify(employees, null, 2));
        const [users] = await pool.execute('SELECT id, username, email FROM users LIMIT 10');
        console.log('Users:', JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
