const pool = require('../config/database');

async function clearGRNData() {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        console.log('🗑️ Deleting all QC Inspections...');
        try {
            await conn.query('DELETE FROM qc_inspections');
            console.log('✅ QC Inspections deleted.');
        } catch (err) {
            console.warn('⚠️ Could not delete qc_inspections (might not exist):', err.message);
        }

        console.log('🗑️ Deleting all QC Reports...');
        try {
            await conn.query('DELETE FROM qc_reports');
            console.log('✅ QC Reports deleted.');
        } catch (err) {
            console.warn('⚠️ Could not delete qc_reports (might not exist):', err.message);
        }

        console.log('🗑️ Deleting all GRNs (Purchase Receipts)...');
        try {
            await conn.query('DELETE FROM grn');
            console.log('✅ GRNs deleted.');
        } catch (err) {
            console.warn('⚠️ Could not delete grn table (might not exist):', err.message);
        }

        await conn.commit();
        console.log('\n✨ All Purchase Receipts and GRN Processing data has been cleared successfully.');
    } catch (error) {
        await conn.rollback();
        console.error('❌ Error clearing data:', error);
    } finally {
        conn.release();
        process.exit(0);
    }
}

clearGRNData();
