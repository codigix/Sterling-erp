const pool = require('../config/database');

const migration = {
  id: '047_rebrand_inventory_tasks',
  description: 'Rebrand project_inventory_tasks to root_card_inventory_tasks and standardize columns',

  async up() {
    const conn = await pool.getConnection();
    try {
      // 1. Rename the table
      await conn.execute('RENAME TABLE project_inventory_tasks TO root_card_inventory_tasks');
      console.log('✅ Renamed table project_inventory_tasks to root_card_inventory_tasks');

      // 2. Rename columns
      // First rename root_card_id to production_root_card_id to avoid conflict when we rename project_id to root_card_id
      await conn.execute(`
        ALTER TABLE root_card_inventory_tasks 
        CHANGE COLUMN root_card_id production_root_card_id INT
      `);
      console.log('✅ Renamed column root_card_id to production_root_card_id');

      await conn.execute(`
        ALTER TABLE root_card_inventory_tasks 
        CHANGE COLUMN project_id root_card_id INT NOT NULL
      `);
      console.log('✅ Renamed column project_id to root_card_id');

      // 3. Update indexes and foreign keys if necessary
      // Note: Most indexes and FKs should still work if they were based on column order/metadata, 
      // but some MySQL versions might need explicit dropping and recreating if names were generated based on column names.
      // However, it's safer to just let MySQL handle it unless we encounter issues.
      // Let's at least rename the index if we can.
      
      try {
        await conn.execute('ALTER TABLE root_card_inventory_tasks RENAME INDEX unique_project_step TO unique_root_card_step');
        await conn.execute('ALTER TABLE root_card_inventory_tasks RENAME INDEX idx_project_id TO idx_root_card_id');
        console.log('✅ Renamed indexes');
      } catch (err) {
        console.warn('⚠️ Could not rename indexes (might not be supported or already renamed):', err.message);
      }

    } catch (error) {
      console.error('Error in migration 047_rebrand_inventory_tasks:', error);
      throw error;
    } finally {
      await conn.release();
    }
  },

  async down() {
    const conn = await pool.getConnection();
    try {
      // Reverse renaming columns
      await conn.execute(`
        ALTER TABLE root_card_inventory_tasks 
        CHANGE COLUMN root_card_id project_id INT NOT NULL
      `);
      
      await conn.execute(`
        ALTER TABLE root_card_inventory_tasks 
        CHANGE COLUMN production_root_card_id root_card_id INT
      `);

      // Rename indexes back
      try {
        await conn.execute('ALTER TABLE root_card_inventory_tasks RENAME INDEX unique_root_card_step TO unique_project_step');
        await conn.execute('ALTER TABLE root_card_inventory_tasks RENAME INDEX idx_root_card_id TO idx_project_id');
      } catch (err) {
        console.warn('⚠️ Could not rename indexes back');
      }

      // Rename table back
      await conn.execute('RENAME TABLE root_card_inventory_tasks TO project_inventory_tasks');
      console.log('✅ Rolled back migration 047_rebrand_inventory_tasks');
    } finally {
      await conn.release();
    }
  }
};

module.exports = migration;
