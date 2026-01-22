const ProductionPhaseDetail = require('../../models/ProductionPhaseDetail');
const ProductionPhaseTracking = require('../../models/ProductionPhaseTracking');

const productionPhaseController = {
  async savePhaseDetail(req, res) {
    try {
      const { rootCardId, subTaskKey, phaseName, subTaskName, stepNumber, ...details } = req.body;
      
      if (!rootCardId || !subTaskKey) {
        return res.status(400).json({ message: 'rootCardId and subTaskKey are required' });
      }

      let phaseDetailId;
      const existing = await ProductionPhaseDetail.findBySubTaskKey(rootCardId, subTaskKey);
      
      if (existing) {
        await ProductionPhaseDetail.update(existing.id, details);
        phaseDetailId = existing.id;
      } else {
        phaseDetailId = await ProductionPhaseDetail.create({
          rootCardId, subTaskKey, phaseName, subTaskName, stepNumber, ...details
        });
      }

      const trackingData = {
        rootCardId, 
        phaseDetailId, 
        subTaskKey, 
        phaseName, 
        subTaskName,
        stepNumber: stepNumber || null,
        processType: details.processType || 'inhouse'
      };

      const existingTracking = (await ProductionPhaseTracking.findByRootCardId(rootCardId))
        .find(t => t.sub_task_key === subTaskKey);

      if (!existingTracking) {
        await ProductionPhaseTracking.create(trackingData);
      }

      res.status(201).json({ 
        message: 'Phase detail saved successfully', 
        phaseDetailId,
        success: true 
      });
    } catch (error) {
      console.error('Error in savePhaseDetail:', error);
      res.status(500).json({ 
        message: 'Error saving phase detail', 
        error: error.message,
        success: false 
      });
    }
  },

  async getPhaseDetails(req, res) {
    try {
      const { rootCardId } = req.params;
      
      if (!rootCardId) {
        return res.status(400).json({ message: 'rootCardId is required' });
      }

      const details = await ProductionPhaseDetail.findByRootCardId(rootCardId);
      const tracking = await ProductionPhaseTracking.findByRootCardId(rootCardId);
      
      res.json({ 
        details, 
        tracking,
        success: true 
      });
    } catch (error) {
      console.error('Error in getPhaseDetails:', error);
      res.status(500).json({ 
        message: 'Error fetching phase details', 
        error: error.message,
        success: false 
      });
    }
  },

  async getPhaseDetail(req, res) {
    try {
      const { phaseDetailId } = req.params;
      
      const detail = await ProductionPhaseDetail.findById(phaseDetailId);
      if (!detail) {
        return res.status(404).json({ message: 'Phase detail not found' });
      }

      res.json({ detail, success: true });
    } catch (error) {
      console.error('Error in getPhaseDetail:', error);
      res.status(500).json({ 
        message: 'Error fetching phase detail', 
        error: error.message,
        success: false 
      });
    }
  },

  async startPhase(req, res) {
    try {
      const { trackingId } = req.params;
      const { assignee } = req.body;
      
      const tracking = await ProductionPhaseTracking.findById(trackingId);
      if (!tracking) {
        return res.status(404).json({ message: 'Tracking record not found' });
      }

      await ProductionPhaseTracking.updateStatus(trackingId, 'In Progress', {
        startTime: new Date().toISOString(),
        assignee: assignee || null
      });

      res.json({ 
        message: 'Phase started successfully',
        success: true 
      });
    } catch (error) {
      console.error('Error in startPhase:', error);
      res.status(500).json({ 
        message: 'Error starting phase', 
        error: error.message,
        success: false 
      });
    }
  },

  async finishPhase(req, res) {
    try {
      const { trackingId } = req.params;
      
      const tracking = await ProductionPhaseTracking.findById(trackingId);
      if (!tracking) {
        return res.status(404).json({ message: 'Tracking record not found' });
      }

      await ProductionPhaseTracking.updateStatus(trackingId, 'Completed', {
        finishTime: new Date().toISOString()
      });

      res.json({ 
        message: 'Phase finished successfully',
        success: true 
      });
    } catch (error) {
      console.error('Error in finishPhase:', error);
      res.status(500).json({ 
        message: 'Error finishing phase', 
        error: error.message,
        success: false 
      });
    }
  },

  async holdPhase(req, res) {
    try {
      const { trackingId } = req.params;
      
      const tracking = await ProductionPhaseTracking.findById(trackingId);
      if (!tracking) {
        return res.status(404).json({ message: 'Tracking record not found' });
      }

      await ProductionPhaseTracking.updateStatus(trackingId, 'On Hold');
      
      res.json({ 
        message: 'Phase put on hold successfully',
        success: true 
      });
    } catch (error) {
      console.error('Error in holdPhase:', error);
      res.status(500).json({ 
        message: 'Error holding phase', 
        error: error.message,
        success: false 
      });
    }
  },

  async cancelPhase(req, res) {
    try {
      const { trackingId } = req.params;
      
      const tracking = await ProductionPhaseTracking.findById(trackingId);
      if (!tracking) {
        return res.status(404).json({ message: 'Tracking record not found' });
      }

      await ProductionPhaseTracking.updateStatus(trackingId, 'Cancelled');
      
      res.json({ 
        message: 'Phase cancelled successfully',
        success: true 
      });
    } catch (error) {
      console.error('Error in cancelPhase:', error);
      res.status(500).json({ 
        message: 'Error cancelling phase', 
        error: error.message,
        success: false 
      });
    }
  },

  async editPhase(req, res) {
    try {
      const { trackingId } = req.params;
      const { details } = req.body;

      const tracking = await ProductionPhaseTracking.findById(trackingId);
      if (!tracking) {
        return res.status(404).json({ message: 'Tracking record not found' });
      }

      if (tracking.phase_detail_id) {
        await ProductionPhaseDetail.update(tracking.phase_detail_id, details);
      }

      res.json({ 
        message: 'Phase details updated successfully',
        success: true 
      });
    } catch (error) {
      console.error('Error in editPhase:', error);
      res.status(500).json({ 
        message: 'Error editing phase', 
        error: error.message,
        success: false 
      });
    }
  }
};

module.exports = productionPhaseController;
