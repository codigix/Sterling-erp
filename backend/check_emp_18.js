const pool = require('./config/database');
(async () => {
    try {
        const [emp] = await pool.execute("SELECT id FROM employees WHERE id = 18");
        console.log('Employee 18 exists:', emp.length > 0);
        
        const [allEmp] = await pool.execute("SELECT id, first_name FROM employees");
        console.log('All employees:', allEmp);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
