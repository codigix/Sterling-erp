const pool = require('./config/database');
(async () => {
    try {
        const [rows] = await pool.execute("SHOW CREATE TABLE work_order_operations");
        console.log('Table schema:', rows[0]['Create Table']);
        
        const [emp] = await pool.execute("SELECT id FROM employees WHERE id = 21");
        console.log('Employee 21 exists:', emp.length > 0);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
