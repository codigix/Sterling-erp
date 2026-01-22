const pool = require('../config/database');

async function up() {
    let connection = null;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        console.log('Creating item_groups table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS item_groups (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log('Updating inventory table with advanced fields...');
        
        // Check which columns already exist to avoid errors
        const [columns] = await connection.execute('DESCRIBE inventory');
        const columnNames = columns.map(c => c.Field);

        const alterQueries = [
            { name: 'item_group_id', query: 'ALTER TABLE inventory ADD COLUMN item_group_id INT AFTER category' },
            { name: 'valuation_rate', query: 'ALTER TABLE inventory ADD COLUMN valuation_rate DECIMAL(12, 2) DEFAULT 0.00' },
            { name: 'selling_rate', query: 'ALTER TABLE inventory ADD COLUMN selling_rate DECIMAL(12, 2) DEFAULT 0.00' },
            { name: 'no_of_cavity', query: 'ALTER TABLE inventory ADD COLUMN no_of_cavity INT DEFAULT 1' },
            { name: 'weight_per_unit', query: 'ALTER TABLE inventory ADD COLUMN weight_per_unit DECIMAL(12, 4) DEFAULT 0.0000' },
            { name: 'weight_uom', query: 'ALTER TABLE inventory ADD COLUMN weight_uom VARCHAR(50)' },
            { name: 'drawing_no', query: 'ALTER TABLE inventory ADD COLUMN drawing_no VARCHAR(255)' },
            { name: 'revision', query: 'ALTER TABLE inventory ADD COLUMN revision VARCHAR(50)' },
            { name: 'material_grade', query: 'ALTER TABLE inventory ADD COLUMN material_grade VARCHAR(255)' },
            { name: 'ean_barcode', query: 'ALTER TABLE inventory ADD COLUMN ean_barcode VARCHAR(255)' }
        ];

        for (const alter of alterQueries) {
            if (!columnNames.includes(alter.name)) {
                await connection.execute(alter.query);
                console.log(`✓ Added ${alter.name} column to inventory`);
            }
        }

        // Add foreign key for item_group_id
        try {
            await connection.execute(`
                ALTER TABLE inventory 
                ADD CONSTRAINT fk_inventory_item_group 
                FOREIGN KEY (item_group_id) REFERENCES item_groups(id) ON DELETE SET NULL
            `);
            console.log('✓ Added foreign key fk_inventory_item_group');
        } catch (err) {
            console.warn('Foreign key might already exist or failed:', err.message);
        }

        await connection.commit();
        console.log('✅ Migration 048_add_item_groups_and_update_inventory completed successfully!');
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error in migration 048:', error.message);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

module.exports = { up };
