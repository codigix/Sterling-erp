const pool = require('../config/database');

class SystemConfig {
  static async getByType(configType) {
    try {
      const [rows] = await pool.execute(
        `SELECT config_key, config_value, display_order 
         FROM system_config 
         WHERE config_type = ? AND is_active = 1 
         ORDER BY display_order ASC`,
        [configType]
      );
      
      return rows.map(row => ({
        key: row.config_key,
        value: row.config_value,
        label: row.config_value
      }));
    } catch (error) {
      console.error(`Error fetching config type ${configType}:`, error);
      return [];
    }
  }

  static async getAll() {
    try {
      const [rows] = await pool.execute(
        `SELECT config_type, config_key, config_value, display_order 
         FROM system_config 
         WHERE is_active = 1 
         ORDER BY config_type, display_order ASC`
      );

      const grouped = {};
      for (const row of rows) {
        if (!grouped[row.config_type]) {
          grouped[row.config_type] = [];
        }
        grouped[row.config_type].push({
          key: row.config_key,
          value: row.config_value,
          label: row.config_value
        });
      }

      return grouped;
    } catch (error) {
      console.error('Error fetching all config:', error);
      return {};
    }
  }

  static async getConfig(configType, configKey) {
    try {
      const [rows] = await pool.execute(
        `SELECT config_value FROM system_config 
         WHERE config_type = ? AND config_key = ? AND is_active = 1`,
        [configType, configKey]
      );

      return rows.length > 0 ? rows[0].config_value : null;
    } catch (error) {
      console.error(`Error fetching config ${configType}.${configKey}:`, error);
      return null;
    }
  }

  static async update(configType, configKey, configValue) {
    try {
      const [result] = await pool.execute(
        `UPDATE system_config 
         SET config_value = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE config_type = ? AND config_key = ?`,
        [configValue, configType, configKey]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error updating config ${configType}.${configKey}:`, error);
      return false;
    }
  }
}

module.exports = SystemConfig;
