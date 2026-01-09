const ProductionPlan = require('../../models/ProductionPlan');
const ManufacturingStage = require('../../models/ManufacturingStage');
const pool = require('../../config/database');

const productionPlanController = {
  async createPlan(req, res) {
    try {
      const {
        projectId,
        salesOrderId,
        rootCardId,
        planName,
        startDate,
        endDate,
        estimatedCompletionDate,
        assignedSupervisor,
        notes,
        finishedGoods
      } = req.body;

      if (!projectId || !planName) {
        return res.status(400).json({ message: 'Project ID and plan name are required' });
      }

      const planId = await ProductionPlan.create({
        projectId,
        salesOrderId,
        rootCardId,
        planName,
        status: 'draft',
        startDate,
        endDate,
        estimatedCompletionDate,
        createdBy: req.user?.id,
        assignedSupervisor,
        notes
      });

      if (finishedGoods && Array.isArray(finishedGoods)) {
        await ProductionPlan.addFinishedGoods(planId, finishedGoods);
      }

      res.status(201).json({
        message: 'Production plan created successfully',
        planId
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating production plan', error: error.message });
    }
  },

  async getPlan(req, res) {
    try {
      const { id } = req.params;
      const plan = await ProductionPlan.findById(id);

      if (!plan) {
        return res.status(404).json({ message: 'Production plan not found' });
      }

      try {
        const finishedGoods = await ProductionPlan.getFinishedGoods(id);
        plan.finishedGoods = finishedGoods || [];
      } catch (fgError) {
        console.warn(`[ProductionPlanController] Could not fetch finished goods for plan ${id}:`, fgError.message);
        plan.finishedGoods = [];
      }

      res.json(plan);
    } catch (error) {
      console.error(`[ProductionPlanController] Error fetching plan ${req.params.id}:`, error.message);
      res.status(500).json({ message: 'Error fetching production plan', error: error.message });
    }
  },

  async getPlanWithStages(req, res) {
    try {
      const { id } = req.params;
      const plan = await ProductionPlan.findById(id);

      if (!plan) {
        return res.status(404).json({ message: 'Production plan not found' });
      }

      const connection = await pool.getConnection();
      try {
        const [stages] = await connection.execute(
          `SELECT * FROM production_plan_stages 
           WHERE production_plan_id = ? 
           ORDER BY sequence ASC`,
          [id]
        );

        let rootCardTitle = 'Unknown';
        if (plan.root_card_id) {
          const rootCard = await require('../../models/RootCard').findById(plan.root_card_id);
          if (rootCard) {
            rootCardTitle = rootCard.title;
          }
        }

        const formattedStages = stages.map(stage => ({
          id: stage.id,
          stageName: stage.stage_name,
          stageType: stage.stage_type,
          status: stage.status,
          sequence: stage.sequence,
          plannedStartDate: stage.planned_start_date,
          plannedEndDate: stage.planned_end_date,
          durationDays: stage.duration_days,
          estimatedDelayDays: stage.estimated_delay_days,
          notes: stage.notes,
          assignedEmployeeId: stage.assigned_employee_id,
          assignedFacilityId: stage.assigned_facility_id,
          assignedVendorId: stage.assigned_vendor_id,
          rootCardTitle: rootCardTitle
        }));

        res.json({
          ...plan,
          stages: formattedStages,
          totalStages: formattedStages.length,
          completedStages: formattedStages.filter(s => s.status === 'completed').length
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error(`[ProductionPlanController] Error fetching plan with stages ${req.params.id}:`, error.message);
      res.status(500).json({ message: 'Error fetching production plan with stages', error: error.message });
    }
  },

  async getAllPlans(req, res) {
    try {
      const { projectId, status, search } = req.query;
      const filters = {};

      if (projectId) {
        filters.projectId = projectId;
      }
      if (status) {
        filters.status = status;
      }
      if (search) {
        filters.search = search;
      }

      const plans = await ProductionPlan.findAll(filters);
      res.json({ plans });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching production plans', error: error.message });
    }
  },

  async updatePlan(req, res) {
    try {
      const { id } = req.params;
      const {
        planName,
        status,
        startDate,
        endDate,
        estimatedCompletionDate,
        assignedSupervisor,
        notes,
        finishedGoods
      } = req.body;

      const plan = await ProductionPlan.findById(id);
      if (!plan) {
        return res.status(404).json({ message: 'Production plan not found' });
      }

      await ProductionPlan.update(id, {
        planName: planName || plan.plan_name,
        status: status || plan.status,
        startDate: startDate || plan.start_date,
        endDate: endDate || plan.end_date,
        estimatedCompletionDate: estimatedCompletionDate || plan.estimated_completion_date,
        assignedSupervisor: assignedSupervisor || plan.assigned_supervisor,
        notes: notes || plan.notes
      });

      if (finishedGoods && Array.isArray(finishedGoods)) {
        await ProductionPlan.addFinishedGoods(id, finishedGoods);
      }

      res.json({ message: 'Production plan updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating production plan', error: error.message });
    }
  },

  async updatePlanStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['draft', 'planning', 'approved', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const plan = await ProductionPlan.findById(id);
      if (!plan) {
        return res.status(404).json({ message: 'Production plan not found' });
      }

      await ProductionPlan.updateStatus(id, status);
      res.json({ message: 'Production plan status updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating plan status', error: error.message });
    }
  },

  async getPlansStats(req, res) {
    try {
      const stats = await ProductionPlan.getStats();
      res.json(stats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
  },

  async deletePlan(req, res) {
    try {
      const { id } = req.params;

      const plan = await ProductionPlan.findById(id);
      if (!plan) {
        return res.status(404).json({ message: 'Production plan not found' });
      }

      await ProductionPlan.delete(id);
      res.json({ message: 'Production plan deleted successfully' });
    } catch (error) {
      console.error('Error deleting production plan:', error);
      res.status(500).json({ message: 'Error deleting production plan', error: error.message });
    }
  }
};

module.exports = productionPlanController;
