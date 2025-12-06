const SystemConfig = require('../../models/SystemConfig');

class SystemConfigController {
  static async getConfigByType(req, res) {
    try {
      const { configType } = req.params;
      
      if (!configType) {
        return res.status(400).json({ 
          success: false, 
          message: 'Config type is required' 
        });
      }

      const data = await SystemConfig.getByType(configType);
      
      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error fetching config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch configuration'
      });
    }
  }

  static async getAllConfig(req, res) {
    try {
      const data = await SystemConfig.getAll();
      
      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error fetching all config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch configuration'
      });
    }
  }

  static async updateConfig(req, res) {
    try {
      const { configType, configKey, configValue } = req.body;
      
      if (!configType || !configKey || !configValue) {
        return res.status(400).json({ 
          success: false, 
          message: 'configType, configKey, and configValue are required' 
        });
      }

      const success = await SystemConfig.update(configType, configKey, configValue);
      
      if (success) {
        res.json({
          success: true,
          message: 'Configuration updated successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Configuration not found'
        });
      }
    } catch (error) {
      console.error('Error updating config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update configuration'
      });
    }
  }
}

module.exports = SystemConfigController;
