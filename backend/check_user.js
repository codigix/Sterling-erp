const pool = require('./config/database');
(async () => {
    try {
        const [users] = await pool.execute('SELECT id, username, email FROM users WHERE email = ?', ['kalesudarshan146@gmail.com']);
        console.log('User for sudarshan kale:', JSON.stringify(users, null, 2));
        
        const [allUsers] = await pool.execute('SELECT id, username, email FROM users');
        console.log('Total users:', allUsers.length);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
