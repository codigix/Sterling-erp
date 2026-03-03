const ProductionPhaseMaster = require('../../models/ProductionPhaseMaster');

const productionPhaseMasterController = {
  async getAllPhases(req, res) {
    try {
      const phases = await ProductionPhaseMaster.findAll();
      res.json({
        success: true,
        data: phases
      });
    } catch (error) {
      console.error('Error in getAllPhases:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching production phases',
        error: error.message
      });
    }
  },

  async createPhase(req, res) {
    try {
      const { name, description, hourlyRate } = req.body;
      
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Phase name is required'
        });
      }

      const existing = await ProductionPhaseMaster.findByName(name);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Production phase already exists'
        });
      }

      const id = await ProductionPhaseMaster.create({ 
        name, 
        description, 
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 0 
      });
      const newPhase = await ProductionPhaseMaster.findById(id);

      res.status(201).json({
        success: true,
        message: 'Production phase created successfully',
        data: newPhase
      });
    } catch (error) {
      console.error('Error in createPhase:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating production phase',
        error: error.message
      });
    }
  }
};

module.exports = productionPhaseMasterController;
