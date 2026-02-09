const pool = require('./config/database');
(async () => {
    try {
        const [users] = await pool.execute("SELECT id, username FROM users");
        console.log('All users:', users);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
