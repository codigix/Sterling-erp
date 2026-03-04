const pool = require('../config/database');

async function up() {
    try {
        console.log('Running migration: 1013_create_production_plan_fg_table');
        
        // The error log shows it's trying to DELETE/INSERT into production_plan_fg
        // Schema based on ProductionPlan.js usage:
        // values = items.map(item => [planId, item.itemId, item.quantity || 1, item.notes || null]);
        
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS production_plan_fg (
                id INT PRIMARY KEY AUTO_INCREMENT,
                production_plan_id INT NOT NULL,
                item_id INT NOT NULL,
                quantity DECIMAL(12, 4) DEFAULT 1,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE CASCADE,
                FOREIGN KEY (item_id) REFERENCES inventory(id) ON DELETE RESTRICT,
                INDEX idx_production_plan (production_plan_id),
                INDEX idx_item (item_id)
            )
        `);
        
        console.log('✓ Table production_plan_fg created successfully');
    } catch (error) {
        console.error('Migration failed:', error.message);
        throw error;
    }
}

async function down() {
    try {
        await pool.execute('DROP TABLE IF EXISTS production_plan_fg');
    } catch (error) {
        console.error('Rollback failed:', error.message);
        throw error;
    }
}

module.exports = { up, down };
