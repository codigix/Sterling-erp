const pool = require('../config/database');

const migration = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('Starting migration: Fix specifications table foreign key constraint...');
    
    await connection.beginTransaction();
    
    await connection.execute(`
      ALTER TABLE specifications 
      DROP FOREIGN KEY specifications_ibfk_2
    `);
    
    await connection.execute(`
      ALTER TABLE specifications 
      ADD CONSTRAINT specifications_ibfk_2 
      FOREIGN KEY (root_card_id) REFERENCES root_cards(id) ON DELETE CASCADE
    `);
    
    await connection.commit();
    console.log('✓ Successfully fixed specifications table foreign key constraint');
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = migration;

if (require.main === module) {
  migration()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
