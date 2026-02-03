const ProductionPlan = require('../../models/ProductionPlan');
const ProductionPlanDetail = require('../../models/ProductionPlanDetail');
const RootCardStep = require('../../models/RootCardStep');
const pool = require('../../config/database');
const { validateProductionPlan } = require('../../utils/rootCardValidators');
const { formatSuccessResponse, formatErrorResponse } = require('../../utils/rootCardHelpers');

class ProductionPlanController {
  static async createOrUpdate(req, res) {
    try {
      const { rootCardId } = req.params;
      const data = req.body;
      const { assignedTo } = req.body;
      const userId = parseInt(req.user.id);
      const userRole = req.user.role?.toLowerCase();

      console.log(`[ProductionPlanController] User ${userId} (${userRole}) saving production plan for SO ${rootCardId}`);
      console.log(`[ProductionPlanController] Received data:`, JSON.stringify(data, null, 2));

      const validation = validateProductionPlan(data);
      if (!validation.isValid) {
        console.warn('Production Plan validation warnings:', validation.errors);
      }

      let detail = await ProductionPlanDetail.findByRootCardId(rootCardId);

      if (detail) {
        console.log(`[ProductionPlanController] Updating existing production plan detail`);
        await ProductionPlanDetail.update(rootCardId, data);
      } else {
        console.log(`[ProductionPlanController] Creating new production plan detail`);
        data.rootCardId = rootCardId;
        await ProductionPlanDetail.create(data);
      }

      const updated = await ProductionPlanDetail.findByRootCardId(rootCardId);
      console.log(`[ProductionPlanController] Saved production plan detail`);
      
      let productionPlanId = null;
      
      // Also create/update in production_plans table for visibility in production plans list
      try {
        let supervisorId = data.supervisorId ? parseInt(data.supervisorId) : null;
        
        // Validate supervisor exists if provided (check employees table)
        if (supervisorId && supervisorId > 0) {
          const [supervisorCheck] = await pool.execute('SELECT id FROM employees WHERE id = ? AND status = "active"', [supervisorId]);
          if (supervisorCheck.length === 0) {
            console.log(`[ProductionPlanController] Supervisor ID ${supervisorId} does not exist, setting to NULL`);
            supervisorId = null;
          }
        }

        const planData = {
          salesOrderId: data.salesOrderId ? parseInt(data.salesOrderId) : (data.rootCardId ? parseInt(data.rootCardId) : parseInt(rootCardId)),
          rootCardId: data.rootCardId ? parseInt(data.rootCardId) : parseInt(rootCardId),
          planName: data.planName || 'Production Plan',
          status: 'draft',
          plannedStartDate: data.timeline?.startDate || null,
          plannedEndDate: data.timeline?.endDate || null,
          estimatedCompletionDate: data.estimatedCompletionDate || null,
          supervisorId: supervisorId,
          notes: data.productionNotes || null
        };

        console.log(`[ProductionPlanController] Creating/updating in production_plans table:`, planData);
        
        // Check if already exists in production_plans
        const existingPlan = await ProductionPlan.findByRootCardId(rootCardId);
        if (existingPlan) {
          console.log(`[ProductionPlanController] Production plan already exists in production_plans table with ID:`, existingPlan.id);
          await ProductionPlan.update(existingPlan.id, planData);
          console.log(`[ProductionPlanController] Updated production plan with ID:`, existingPlan.id);
          productionPlanId = existingPlan.id;
        } else {
          productionPlanId = await ProductionPlan.create(planData);
          console.log(`[ProductionPlanController] Created production plan in production_plans table with ID:`, productionPlanId);
        }
      } catch (planError) {
        console.warn(`[ProductionPlanController] Warning - could not create in production_plans table:`, planError.message);
      }
      
      await RootCardStep.update(rootCardId, 4, { status: 'in_progress', data: updated, assignedTo });
      
      if (assignedTo) {
        await RootCardStep.assignEmployee(rootCardId, 4, assignedTo);
        
        try {
          const RootCard = require('../../models/RootCard');
          const EmployeeTask = require('../../models/EmployeeTask');
          
          const rootCard = await RootCard.findById(rootCardId);
          const existingTasks = await EmployeeTask.findByRelatedId(rootCardId, 'production_plan');
          
          if (existingTasks.length === 0) {
            await EmployeeTask.createAssignedTask(assignedTo, {
              title: `Production Plan: ${rootCard?.project_name || rootCard?.title || 'Project'}`,
              description: `Create production plan for Root Card ${rootCard?.po_number || ''}`,
              type: 'production_plan',
              priority: rootCard?.priority || 'medium',
              dueDate: rootCard?.due_date,
              salesOrderId: rootCardId,
              notes: `Auto-assigned from Admin Root Card flow`
            });
            console.log(`[ProductionPlanController] ✓ Task created for employee ${assignedTo}`);
          } else {
            const task = existingTasks[0];
            if (task.employee_id !== parseInt(assignedTo)) {
              await pool.execute('UPDATE employee_tasks SET employee_id = ? WHERE id = ?', [assignedTo, task.id]);
              console.log(`[ProductionPlanController] ✓ Task ${task.id} reassigned to employee ${assignedTo}`);
            }
          }
        } catch (taskError) {
          console.error('[ProductionPlanController] Error handling employee task:', taskError.message);
        }
      }

      const responseData = {
        ...updated,
        planId: productionPlanId
      };
      
      res.json(formatSuccessResponse(responseData, 'Production plan saved'));
    } catch (error) {
      console.error(`[ProductionPlanController] Error:`, error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getProductionPlan(req, res) {
    try {
      const { rootCardId } = req.params;
      const detail = await ProductionPlanDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(detail || null, 'Production plan retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async validateTimeline(req, res) {
    try {
      const { rootCardId } = req.params;
      const { startDate, endDate } = req.body;

      const errors = [];
      const warnings = [];

      if (!startDate) {
        errors.push('Start date is required');
      }

      if (!endDate) {
        errors.push('End date is required');
      }

      if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
        errors.push('End date must be after start date');
      }

      res.json(formatSuccessResponse({
        isValid: errors.length === 0,
        errors,
        warnings
      }, 'Timeline validation completed'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async validatePhases(req, res) {
    try {
      const { rootCardId } = req.params;

      const detail = await ProductionPlanDetail.findByRootCardId(rootCardId);
      if (!detail) {
        return res.json(formatSuccessResponse({
          isValid: true,
          errors: [],
          warnings: ['Production plan not yet initialized']
        }, 'Phases validation completed (no data)'));
      }

      const errors = [];
      const warnings = [];

      if (!detail.selectedPhases || Object.keys(detail.selectedPhases).length === 0) {
        warnings.push('No production phases selected');
      }

      Object.entries(detail.selectedPhases || {}).forEach(([key, phase]) => {
        if (!phase.startDate) {
          errors.push(`Phase ${key} is missing start date`);
        }
        if (!phase.endDate) {
          errors.push(`Phase ${key} is missing end date`);
        }
      });

      res.json(formatSuccessResponse({
        isValid: errors.length === 0,
        errors,
        warnings
      }, 'Phases validation completed'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async validateProductionPlan(req, res) {
    try {
      const { rootCardId } = req.params;

      const detail = await ProductionPlanDetail.findByRootCardId(rootCardId);
      
      const errors = [];
      const warnings = [];

      if (!detail) {
        return res.json(formatSuccessResponse({
          isValid: true,
          errors: [],
          warnings: ['Production plan not yet initialized'],
          planData: null
        }, 'Production plan validation completed (no data)'));
      }

      if (!detail.timeline || !detail.timeline.startDate || !detail.timeline.endDate) {
        errors.push('Timeline (start and end dates) is incomplete');
      }

      if (!detail.selectedPhases || Object.keys(detail.selectedPhases).length === 0) {
        warnings.push('No production phases selected');
      }

      res.json(formatSuccessResponse({
        isValid: errors.length === 0,
        errors,
        warnings,
        planData: detail
      }, 'Production plan validation completed'));
    } catch (error) {
      console.error('Error validating Production Plan:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async addPhase(req, res) {
    try {
      const { rootCardId } = req.params;
      const { phaseKey, phase } = req.body;

      if (!phaseKey || !phase) {
        return res.status(400).json(formatErrorResponse('Phase key and data are required'));
      }

      let detail = await ProductionPlanDetail.findByRootCardId(rootCardId);

      if (!detail) {
        await ProductionPlanDetail.create({
          rootCardId,
          selectedPhases: { [phaseKey]: phase }
        });
      } else {
        const selectedPhases = detail.selectedPhases || {};
        selectedPhases[phaseKey] = phase;
        await ProductionPlanDetail.update(rootCardId, { selectedPhases });
      }

      const updated = await ProductionPlanDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Phase added'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getPhases(req, res) {
    try {
      const { rootCardId } = req.params;
      const detail = await ProductionPlanDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(detail?.selectedPhases || {}, 'Phases retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getPhase(req, res) {
    try {
      const { rootCardId, phaseKey } = req.params;
      const detail = await ProductionPlanDetail.findByRootCardId(rootCardId);
      const phase = detail?.selectedPhases?.[phaseKey];
      res.json(formatSuccessResponse(phase || null, 'Phase retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updatePhase(req, res) {
    try {
      const { rootCardId, phaseKey } = req.params;
      const phase = req.body;

      let detail = await ProductionPlanDetail.findByRootCardId(rootCardId);
      if (!detail) {
        await ProductionPlanDetail.create({
          rootCardId,
          selectedPhases: { [phaseKey]: phase }
        });
      } else {
        const selectedPhases = detail.selectedPhases || {};
        selectedPhases[phaseKey] = { ...selectedPhases[phaseKey], ...phase };
        await ProductionPlanDetail.update(rootCardId, { selectedPhases });
      }

      const updated = await ProductionPlanDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Phase updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async removePhase(req, res) {
    try {
      const { rootCardId, phaseKey } = req.params;

      let detail = await ProductionPlanDetail.findByRootCardId(rootCardId);
      if (detail) {
        const selectedPhases = detail.selectedPhases || {};
        delete selectedPhases[phaseKey];
        await ProductionPlanDetail.update(rootCardId, { selectedPhases });
      }

      const updated = await ProductionPlanDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Phase removed'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updatePhaseStatus(req, res) {
    try {
      const { rootCardId, phaseKey } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json(formatErrorResponse('Status is required'));
      }

      let detail = await ProductionPlanDetail.findByRootCardId(rootCardId);
      if (!detail) {
        await ProductionPlanDetail.create({
          rootCardId,
          selectedPhases: { [phaseKey]: { status } }
        });
      } else {
        const selectedPhases = detail.selectedPhases || {};
        if (selectedPhases[phaseKey]) {
          selectedPhases[phaseKey].status = status;
        } else {
          selectedPhases[phaseKey] = { status };
        }
        await ProductionPlanDetail.update(rootCardId, { selectedPhases });
      }

      const updated = await ProductionPlanDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Phase status updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = ProductionPlanController;
