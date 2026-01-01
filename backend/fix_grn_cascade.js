const pool = require('./config/database');

async function fixGRNCascadeDelete() {
  const conn = await pool.getConnection();
  try {
    console.log('Starting migration to fix GRN cascade delete...');

    // 1. Drop the existing foreign key constraint
    // We assume the constraint name is 'goods_receipt_notes_ibfk_1' as per the error message.
    // If you are unsure, you can query information_schema.KEY_COLUMN_USAGE to find it dynamically.
    // For now, we'll try dropping the specific constraint mentioned in the error.
    
    // Check if constraint exists before dropping (optional, but good for re-running)
    // Or just wrap in try-catch if it fails (it might not exist if named differently)
    
    // NOTE: The error message specifically said:
    // CONSTRAINT `goods_receipt_notes_ibfk_1` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`id`)
    
    try {
        console.log('Dropping existing foreign key constraint...');
        await conn.query('ALTER TABLE goods_receipt_notes DROP FOREIGN KEY goods_receipt_notes_ibfk_1');
    } catch (e) {
        console.log('Warning dropping FK (might not exist or different name):', e.message);
        // Fallback: try to find the constraint name if standard name failed
        const [rows] = await conn.query(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = 'goods_receipt_notes' 
            AND COLUMN_NAME = 'po_id' 
            AND REFERENCED_TABLE_NAME = 'purchase_orders'
            AND TABLE_SCHEMA = DATABASE()
        `);
        
        if (rows.length > 0) {
            const constraintName = rows[0].CONSTRAINT_NAME;
            console.log(`Found constraint name: ${constraintName}. Dropping it...`);
            await conn.query(`ALTER TABLE goods_receipt_notes DROP FOREIGN KEY ${constraintName}`);
        }
    }

    // 2. Add the new foreign key constraint with ON DELETE CASCADE
    console.log('Adding new foreign key constraint with ON DELETE CASCADE...');
    await conn.query(`
      ALTER TABLE goods_receipt_notes
      ADD CONSTRAINT goods_receipt_notes_po_id_fk
      FOREIGN KEY (po_id) REFERENCES purchase_orders(id)
      ON DELETE CASCADE
    `);

    console.log('Migration completed successfully.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    conn.release();
    process.exit();
  }
}

fixGRNCascadeDelete();
