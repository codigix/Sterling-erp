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

      // Determine if this is a Root Card or a Sales Order
      const [rcCheck] = await pool.execute('SELECT id FROM root_cards WHERE id = ?', [rootCardId]);
      const isRootCard = rcCheck.length > 0;

      console.log(`[ProductionPlanController] User ${userId} (${userRole}) saving production plan for ${isRootCard ? 'Root Card' : 'SO'} ${rootCardId}`);
      console.log(`[ProductionPlanController] Received data:`, JSON.stringify(data, null, 2));

      const validation = validateProductionPlan(data);
      if (!validation.isValid) {
        console.warn('Production Plan validation warnings:', validation.errors);
      }

      // 1. First ensure the production_plan exists in the main production_plans table
      let productionPlanId = null;
      try {
        let supervisorId = data.supervisorId ? parseInt(data.supervisorId) : null;
        
        // Validate supervisor exists if provided
        if (supervisorId && supervisorId > 0) {
          const [supervisorCheck] = await pool.execute('SELECT id FROM employees WHERE id = ? AND status = "active"', [supervisorId]);
          if (supervisorCheck.length === 0) supervisorId = null;
        }

        let finalSalesOrderId = data.salesOrderId ? parseInt(data.salesOrderId) : null;
        if (!finalSalesOrderId && rootCardId) {
          if (!isRootCard) {
            const [soCheck] = await pool.execute('SELECT id FROM sales_orders WHERE id = ?', [rootCardId]);
            if (soCheck.length > 0) finalSalesOrderId = parseInt(rootCardId);
          } else {
            const [rcLink] = await pool.execute('SELECT sales_order_id FROM root_cards WHERE id = ?', [rootCardId]);
            if (rcLink.length > 0 && rcLink[0].sales_order_id) finalSalesOrderId = rcLink[0].sales_order_id;
          }
        }

        let finalPlanName = data.planName || `Production Plan for ${isRootCard ? 'RC' : 'SO'} ${rootCardId}`;
        let finalPlanId = data.planId || data.id;
        
        // Generate a unique ID if not provided, to avoid "Duplicate entry 'Production Plan'"
        if (!finalPlanId || finalPlanId === 'Production Plan') {
          finalPlanId = `PP-${Date.now()}-${rootCardId}`;
        }

        const planData = {
          id: finalPlanId,
          salesOrderId: finalSalesOrderId,
          rootCardId: isRootCard ? parseInt(rootCardId) : null,
          planName: finalPlanName,
          targetQuantity: data.targetQuantity || 1,
          status: 'draft',
          plannedStartDate: data.timeline?.startDate || null,
          plannedEndDate: data.timeline?.endDate || null,
          estimatedCompletionDate: data.estimatedCompletionDate || null,
          supervisorId: supervisorId,
          notes: data.productionNotes || null
        };

        const existingPlan = isRootCard 
          ? await ProductionPlan.findByRootCardId(rootCardId)
          : await ProductionPlan.findBySalesOrderId(rootCardId);

        if (existingPlan) {
          await ProductionPlan.update(existingPlan.id, planData);
          productionPlanId = existingPlan.id;
        } else {
          productionPlanId = await ProductionPlan.create(planData);
        }
      } catch (planError) {
        console.error(`[ProductionPlanController] Error in production_plans sync:`, planError);
        throw planError;
      }

      // 2. Now save the detailed JSON data to production_plan_details
      let detail = isRootCard 
        ? await ProductionPlanDetail.findByRootCardId(rootCardId)
        : await ProductionPlanDetail.findBySalesOrderId(rootCardId);

      // Add the productionPlanId to the data for the model to use
      data.productionPlanId = productionPlanId;

      if (detail) {
        console.log(`[ProductionPlanController] Updating existing production plan detail`);
        // Ensure the update also sets the production_plan_id link if it was missing
        await pool.execute(
          'UPDATE production_plan_details SET production_plan_id = ? WHERE id = ?',
          [productionPlanId, detail.id]
        );
        await ProductionPlanDetail.update(rootCardId, data, isRootCard);
      } else {
        console.log(`[ProductionPlanController] Creating new production plan detail`);
        if (isRootCard) {
          data.rootCardId = rootCardId;
          data.salesOrderId = null;
        } else {
          data.salesOrderId = rootCardId;
          data.rootCardId = null;
        }
        await ProductionPlanDetail.create(data);
      }

      const updated = isRootCard 
        ? await ProductionPlanDetail.findByRootCardId(rootCardId)
        : await ProductionPlanDetail.findBySalesOrderId(rootCardId);
      console.log(`[ProductionPlanController] Saved production plan detail`);
      
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
      
      const [rcCheck] = await pool.execute('SELECT id FROM root_cards WHERE id = ?', [rootCardId]);
      const isRootCard = rcCheck.length > 0;

      const detail = isRootCard 
        ? await ProductionPlanDetail.findByRootCardId(rootCardId)
        : await ProductionPlanDetail.findBySalesOrderId(rootCardId);

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

  static async _getIsRootCard(id) {
    const [rcCheck] = await pool.execute('SELECT id FROM root_cards WHERE id = ?', [id]);
    return rcCheck.length > 0;
  }

  static async validatePhases(req, res) {
    try {
      const { rootCardId } = req.params;
      const isRootCard = await this._getIsRootCard(rootCardId);

      const detail = isRootCard 
        ? await ProductionPlanDetail.findByRootCardId(rootCardId)
        : await ProductionPlanDetail.findBySalesOrderId(rootCardId);
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
      const isRootCard = await this._getIsRootCard(rootCardId);

      const detail = isRootCard 
        ? await ProductionPlanDetail.findByRootCardId(rootCardId)
        : await ProductionPlanDetail.findBySalesOrderId(rootCardId);
      
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
      const isRootCard = await this._getIsRootCard(rootCardId);

      if (!phaseKey || !phase) {
        return res.status(400).json(formatErrorResponse('Phase key and data are required'));
      }

      let detail = isRootCard 
        ? await ProductionPlanDetail.findByRootCardId(rootCardId)
        : await ProductionPlanDetail.findBySalesOrderId(rootCardId);

      if (!detail) {
        const createData = isRootCard 
          ? { rootCardId, selectedPhases: { [phaseKey]: phase } }
          : { salesOrderId: rootCardId, selectedPhases: { [phaseKey]: phase } };
        await ProductionPlanDetail.create(createData);
      } else {
        const selectedPhases = detail.selectedPhases || {};
        selectedPhases[phaseKey] = phase;
        await ProductionPlanDetail.update(rootCardId, { selectedPhases }, isRootCard);
      }

      const updated = isRootCard 
        ? await ProductionPlanDetail.findByRootCardId(rootCardId)
        : await ProductionPlanDetail.findBySalesOrderId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Phase added'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getPhases(req, res) {
    try {
      const { rootCardId } = req.params;
      const isRootCard = await this._getIsRootCard(rootCardId);
      const detail = isRootCard 
        ? await ProductionPlanDetail.findByRootCardId(rootCardId)
        : await ProductionPlanDetail.findBySalesOrderId(rootCardId);
      res.json(formatSuccessResponse(detail?.selectedPhases || {}, 'Phases retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getPhase(req, res) {
    try {
      const { rootCardId, phaseKey } = req.params;
      const isRootCard = await this._getIsRootCard(rootCardId);
      const detail = isRootCard 
        ? await ProductionPlanDetail.findByRootCardId(rootCardId)
        : await ProductionPlanDetail.findBySalesOrderId(rootCardId);
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
      const isRootCard = await this._getIsRootCard(rootCardId);

      let detail = isRootCard 
        ? await ProductionPlanDetail.findByRootCardId(rootCardId)
        : await ProductionPlanDetail.findBySalesOrderId(rootCardId);
      if (!detail) {
        const createData = isRootCard 
          ? { rootCardId, selectedPhases: { [phaseKey]: phase } }
          : { salesOrderId: rootCardId, selectedPhases: { [phaseKey]: phase } };
        await ProductionPlanDetail.create(createData);
      } else {
        const selectedPhases = detail.selectedPhases || {};
        selectedPhases[phaseKey] = { ...selectedPhases[phaseKey], ...phase };
        await ProductionPlanDetail.update(rootCardId, { selectedPhases }, isRootCard);
      }

      const updated = isRootCard 
        ? await ProductionPlanDetail.findByRootCardId(rootCardId)
        : await ProductionPlanDetail.findBySalesOrderId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Phase updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async removePhase(req, res) {
    try {
      const { rootCardId, phaseKey } = req.params;
      const isRootCard = await this._getIsRootCard(rootCardId);

      let detail = isRootCard 
        ? await ProductionPlanDetail.findByRootCardId(rootCardId)
        : await ProductionPlanDetail.findBySalesOrderId(rootCardId);
      if (detail) {
        const selectedPhases = detail.selectedPhases || {};
        delete selectedPhases[phaseKey];
        await ProductionPlanDetail.update(rootCardId, { selectedPhases }, isRootCard);
      }

      const updated = isRootCard 
        ? await ProductionPlanDetail.findByRootCardId(rootCardId)
        : await ProductionPlanDetail.findBySalesOrderId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Phase removed'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updatePhaseStatus(req, res) {
    try {
      const { rootCardId, phaseKey } = req.params;
      const { status } = req.body;
      const isRootCard = await this._getIsRootCard(rootCardId);

      if (!status) {
        return res.status(400).json(formatErrorResponse('Status is required'));
      }

      let detail = isRootCard 
        ? await ProductionPlanDetail.findByRootCardId(rootCardId)
        : await ProductionPlanDetail.findBySalesOrderId(rootCardId);
      if (!detail) {
        const createData = isRootCard 
          ? { rootCardId, selectedPhases: { [phaseKey]: { status } } }
          : { salesOrderId: rootCardId, selectedPhases: { [phaseKey]: { status } } };
        await ProductionPlanDetail.create(createData);
      } else {
        const selectedPhases = detail.selectedPhases || {};
        if (selectedPhases[phaseKey]) {
          selectedPhases[phaseKey].status = status;
        } else {
          selectedPhases[phaseKey] = { status };
        }
        await ProductionPlanDetail.update(rootCardId, { selectedPhases }, isRootCard);
      }

      const updated = isRootCard 
        ? await ProductionPlanDetail.findByRootCardId(rootCardId)
        : await ProductionPlanDetail.findBySalesOrderId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Phase status updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = ProductionPlanController;
