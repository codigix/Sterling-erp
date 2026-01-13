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
      
      // Fetch the created stages to get their IDs for employee/department task creation
      const [createdStages] = await pool.execute(
        `SELECT id, stage_name, assigned_employee_id, stage_type, sequence, is_blocked FROM production_plan_stages WHERE production_plan_id = ? ORDER BY sequence ASC`,
        [id]
      );
      
      // Create employee tasks ONLY for the first stage (Stage 1)
      const EmployeeTask = require('../../models/EmployeeTask');
      const Department = require('../../models/Department');
      
      // Process only the first stage
      if (createdStages.length > 0) {
        const firstStage = createdStages[0];
        console.log(`[ProductionPlanController] Processing first stage: ${firstStage.stage_name} (ID: ${firstStage.id})`);
        
        // Check if this is an outsourced stage
        if (firstStage.stage_type === 'outsource') {
          try {
            console.log(`[ProductionPlanController] ✓ First stage ${firstStage.stage_name} is outsourced`);
            
            // Send notification to Production Department about new outsource task
            try {
              const AlertsNotification = require('../../models/AlertsNotification');
              
              // Get all employees in Production Department
              const [deptMembers] = await pool.execute(`
                SELECT DISTINCT e.id 
                FROM employees e
                WHERE e.department = 'Production' OR e.department_name = 'Production'
                LIMIT 20
              `);
              
              // Send notification to each department member
              for (const member of deptMembers) {
                try {
                  await AlertsNotification.create({
                    userId: member.id,
                    alertType: 'outsource_task_created',
                    message: `New outsource task "${firstStage.stage_name}" is ready for production. Previous stage completed!`,
                    relatedTable: 'production_plan_stages',
                    relatedId: firstStage.id,
                    priority: 'high'
                  });
                  console.log(`[ProductionPlanController] ✓ Notification sent to employee ${member.id} for outsource task`);
                } catch (notifErr) {
                  console.warn(`[ProductionPlanController] Warning - could not send notification to employee ${member.id}:`, notifErr.message);
                }
              }
            } catch (notificationError) {
              console.warn(`[ProductionPlanController] Warning - could not send notifications:`, notificationError.message);
            }
          } catch (taskError) {
            console.warn(`[ProductionPlanController] Warning - error handling outsource stage:`, taskError.message);
          }
        } else if (firstStage.assigned_employee_id) {
          // In-house task - assign to employee
          try {
            const taskTitle = plan.product_name 
              ? `Task for ${plan.product_name}: ${firstStage.stage_name}`
              : `Production Stage: ${firstStage.stage_name}`;
              
            console.log(`[ProductionPlanController] Creating employee task for employee ${firstStage.assigned_employee_id} for stage ${firstStage.stage_name}`);
            await EmployeeTask.createAssignedTask(firstStage.assigned_employee_id, {
              title: taskTitle,
              description: `Assigned to production plan stage`,
              type: 'production_stage',
              priority: 'medium',
              dueDate: null,
              notes: `Production Plan ID: ${id}`,
              productionPlanStageId: firstStage.id
            });
            console.log(`[ProductionPlanController] ✓ Employee task created for employee ${firstStage.assigned_employee_id}`);
          } catch (taskError) {
            console.warn(`[ProductionPlanController] Warning - could not create employee task:`, taskError.message);
          }
        }
      }
      
      // All other stages remain blocked until the previous one is completed
      console.log(`[ProductionPlanController] ✓ Stages 2+ are blocked until Stage 1 is completed`);
      
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

      // If updated to outsource, ensure an outsourcing task exists
      if (stageType === 'outsource') {
        const [existingTasks] = await pool.execute(
          'SELECT id FROM outsourcing_tasks WHERE production_plan_stage_id = ?',
          [stageId]
        );

        if (existingTasks.length === 0) {
          console.log('[ProductionPlanController.updatePlanStage] Creating missing outsourcing_task for stage:', stageId);
          
          // Get details for the new task
          const [stageDetails] = await pool.execute(
            `SELECT pps.production_plan_id, pp.root_card_id, pp.sales_order_id, rc.project_id, so.items as so_items, sod.product_details
             FROM production_plan_stages pps
             JOIN production_plans pp ON pps.production_plan_id = pp.id
             LEFT JOIN root_cards rc ON pp.root_card_id = rc.id
             LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
             LEFT JOIN sales_order_details sod ON pp.sales_order_id = sod.sales_order_id
             WHERE pps.id = ?`,
            [stageId]
          );

          if (stageDetails.length > 0) {
            const details = stageDetails[0];
            let productName = '-';
            
            // Extract product name
            if (details.product_details) {
              try {
                const pd = typeof details.product_details === 'string' ? JSON.parse(details.product_details) : details.product_details;
                if (pd?.itemName) productName = pd.itemName;
              } catch (e) {}
            }
            if (productName === '-' && details.so_items) {
              try {
                const items = typeof details.so_items === 'string' ? JSON.parse(details.so_items) : details.so_items;
                if (Array.isArray(items) && items.length > 0) {
                  productName = items[0].name || items[0].itemName || productName;
                }
              } catch (e) {}
            }
            if (productName === '-') {
              const [rcDetails] = await pool.execute('SELECT title FROM root_cards WHERE id = ?', [details.root_card_id]);
              if (rcDetails.length > 0) productName = rcDetails[0].title;
            }

            await pool.execute(
              `INSERT INTO outsourcing_tasks 
               (production_plan_stage_id, production_plan_id, project_id, root_card_id, product_name, status)
               VALUES (?, ?, ?, ?, ?, 'pending')`,
              [
                stageId,
                details.production_plan_id,
                details.project_id || null,
                details.root_card_id || null,
                productName,
              ]
            );
          }
        }
      }

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
