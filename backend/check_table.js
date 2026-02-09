const pool = require('./config/database');
(async () => {
    try {
        const [columns] = await pool.execute('DESCRIBE employee_tasks');
        console.log('employee_tasks columns:', columns);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
