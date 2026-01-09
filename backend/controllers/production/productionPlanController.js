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
          `SELECT pps.*,
                  CONCAT(e.first_name, ' ', e.last_name) AS worker_name,
                  e.email AS worker_email
           FROM production_plan_stages pps
           LEFT JOIN employees e ON e.id = pps.assigned_employee_id
           WHERE pps.production_plan_id = ? 
           ORDER BY pps.sequence ASC`,
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
          plannedStart: stage.planned_start_date,
          plannedEnd: stage.planned_end_date,
          plannedStartDate: stage.planned_start_date,
          plannedEndDate: stage.planned_end_date,
          durationDays: stage.duration_days,
          estimatedDelayDays: stage.estimated_delay_days,
          notes: stage.notes,
          assignedEmployeeId: stage.assigned_employee_id,
          workerName: stage.worker_name || null,
          workerEmail: stage.worker_email || null,
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
  },

  async createPlanStages(req, res) {
    try {
      const { id } = req.params;
      const stages = req.body;

      console.log('[ProductionPlanController] createPlanStages called for plan ID:', id);
      console.log('[ProductionPlanController] Received stages:', JSON.stringify(stages, null, 2));

      const plan = await ProductionPlan.findById(id);
      if (!plan) {
        return res.status(404).json({ message: 'Production plan not found' });
      }

      console.log('[ProductionPlanController] Final stages being inserted:', JSON.stringify(stages, null, 2));

      await ProductionPlan.addStages(id, stages);
      
      // Fetch the created stages to get their IDs for employee task creation
      const [createdStages] = await pool.execute(
        `SELECT id, stage_name, assigned_employee_id FROM production_plan_stages WHERE production_plan_id = ? ORDER BY sequence ASC`,
        [id]
      );
      
      // Create employee tasks for assigned employees
      const EmployeeTask = require('../../models/EmployeeTask');
      for (const createdStage of createdStages) {
        if (createdStage.assigned_employee_id) {
          try {
            console.log(`[ProductionPlanController] Creating employee task for employee ${createdStage.assigned_employee_id} for stage ${createdStage.stage_name}`);
            await EmployeeTask.createAssignedTask(createdStage.assigned_employee_id, {
              title: `Production Stage: ${createdStage.stage_name}`,
              description: `Assigned to production plan stage`,
              type: 'production_stage',
              priority: 'medium',
              dueDate: null,
              notes: `Production Plan ID: ${id}`,
              productionPlanStageId: createdStage.id
            });
            console.log(`[ProductionPlanController] ✓ Employee task created for employee ${createdStage.assigned_employee_id}`);
          } catch (taskError) {
            console.warn(`[ProductionPlanController] Warning - could not create employee task:`, taskError.message);
          }
        }
      }
      
      res.status(201).json({ 
        message: 'Production plan stages created successfully',
        stageCount: stages.length 
      });
    } catch (error) {
      console.error('[ProductionPlanController] Error creating stages:', error);
      console.error('[ProductionPlanController] Error message:', error.message);
      console.error('[ProductionPlanController] Error stack:', error.stack);
      res.status(500).json({ message: 'Error creating production plan stages', error: error.message });
    }
  },

  async updatePlanStage(req, res) {
    try {
      const { id: stageId } = req.params;
      const { stageName, stageType, assignedEmployeeId, assignedFacilityId, plannedStartDate, plannedEndDate, notes } = req.body;

      console.log('[ProductionPlanController.updatePlanStage] Updating stage:', stageId);
      console.log('[ProductionPlanController.updatePlanStage] Data:', { stageName, stageType, assignedEmployeeId, assignedFacilityId, plannedStartDate, plannedEndDate, notes });

      // Calculate duration from start and end dates
      let durationDays = null;
      if (plannedStartDate && plannedEndDate) {
        const startDate = new Date(plannedStartDate);
        const endDate = new Date(plannedEndDate);
        const timeDiff = endDate - startDate;
        durationDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        console.log(`[ProductionPlanController.updatePlanStage] Calculated duration: ${durationDays} days (${plannedStartDate} to ${plannedEndDate})`);
      }

      // Validate employee exists if provided (check in employees table, not users)
      let employeeId = assignedEmployeeId ? parseInt(assignedEmployeeId) : null;
      if (employeeId && employeeId > 0) {
        const [empCheck] = await pool.execute('SELECT id FROM employees WHERE id = ? AND status = "active"', [employeeId]);
        if (empCheck.length === 0) {
          console.log(`[ProductionPlanController.updatePlanStage] Employee ID ${employeeId} does not exist or is inactive, setting to NULL`);
          employeeId = null;
        } else {
          console.log(`[ProductionPlanController.updatePlanStage] ✓ Employee ID ${employeeId} validated successfully`);
        }
      } else {
        employeeId = null;
      }

      // Validate facility if provided
      let facilityId = assignedFacilityId ? parseInt(assignedFacilityId) : null;
      if (facilityId && facilityId > 0) {
        const [facCheck] = await pool.execute('SELECT id FROM manufacturing_facilities WHERE id = ?', [facilityId]);
        if (facCheck.length === 0) {
          console.log(`[ProductionPlanController.updatePlanStage] Facility ID ${facilityId} does not exist, setting to NULL`);
          facilityId = null;
        }
      } else {
        facilityId = null;
      }

      const query = `
        UPDATE production_plan_stages
        SET stage_name = ?, stage_type = ?, assigned_employee_id = ?, assigned_facility_id = ?,
            planned_start_date = ?, planned_end_date = ?, duration_days = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      console.log('[ProductionPlanController.updatePlanStage] Executing query:', query);

      await pool.execute(query, [
        stageName,
        stageType,
        employeeId,
        facilityId,
        plannedStartDate || null,
        plannedEndDate || null,
        durationDays,
        notes || null,
        stageId
      ]);

      console.log('[ProductionPlanController.updatePlanStage] ✓ Stage updated successfully');

      res.json({ 
        message: 'Production plan stage updated successfully',
        stageId 
      });
    } catch (error) {
      console.error('[ProductionPlanController.updatePlanStage] Error updating stage:', error);
      res.status(500).json({ message: 'Error updating production plan stage', error: error.message });
    }
  }
};

module.exports = productionPlanController;
