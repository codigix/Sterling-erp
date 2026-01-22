const pool = require('../config/database');

async function up() {
    let connection = null;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        console.log('Adding gst_percent column to inventory table...');
        
        const [columns] = await connection.execute('DESCRIBE inventory');
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('gst_percent')) {
            await connection.execute('ALTER TABLE inventory ADD COLUMN gst_percent DECIMAL(5, 2) DEFAULT 0.00 AFTER ean_barcode');
            console.log('✓ Added gst_percent column to inventory');
        }

        await connection.commit();
        console.log('✅ Migration 049_add_gst_percent_to_inventory completed successfully!');
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error in migration 049:', error.message);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

module.exports = { up };
