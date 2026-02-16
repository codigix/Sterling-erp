const pool = require('./config/database');

async function truncateTables() {
    try {
        console.log('Truncating inventory and procurement data...');
        
        // Disable foreign key checks to allow truncation
        await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        const tables = [
            'purchase_orders',
            'grn',
            'material_requests',
            'stock_entries',
            'material_stock',
            'inventory'
        ];
        
        for (const table of tables) {
            try {
                await pool.execute(`TRUNCATE TABLE ${table}`);
                console.log(`✓ Truncated ${table}`);
            } catch (err) {
                console.error(`✗ Error truncating ${table}:`, err.message);
            }
        }
        
        await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Data truncation completed.');
    } catch (error) {
        console.error('Truncation failed:', error);
    } finally {
        process.exit();
    }
}

truncateTables();
