const ProductionPlan = require('../../models/ProductionPlan');
const ProductionPlanDetail = require('../../models/ProductionPlanDetail');
const ManufacturingStage = require('../../models/ManufacturingStage');
const WorkOrder = require('../../models/WorkOrder');
const MaterialRequest = require('../../models/MaterialRequest');
const ComprehensiveBOM = require('../../models/ComprehensiveBOM');
const WorkflowTaskHelper = require('../../utils/workflowTaskHelper');
const pool = require('../../config/database');

const productionPlanController = {
  async createPlan(req, res) {
    try {
      const {
        projectId,
        salesOrderId,
        rootCardId,
        bomId,
        planName,
        startDate,
        endDate,
        plannedStartDate,
        plannedEndDate,
        estimatedCompletionDate,
        assignedSupervisor,
        targetQuantity,
        notes,
        finishedGoods,
        materials,
        subAssemblies,
        stages
      } = req.body;

      if (!planName) {
        return res.status(400).json({ message: 'Plan name is required' });
      }

      const planId = await ProductionPlan.create({
        projectId,
        salesOrderId,
        rootCardId,
        bomId,
        planName,
        targetQuantity: (targetQuantity !== undefined && targetQuantity !== null && targetQuantity !== '') ? targetQuantity : 1,
        status: 'draft',
        plannedStartDate: plannedStartDate || startDate,
        plannedEndDate: plannedEndDate || endDate,
        estimatedCompletionDate,
        createdBy: req.user?.id,
        supervisorId: assignedSupervisor,
        notes
      });

      // Update or Create production_plan_details with full data
      const detailData = {
        ...req.body,
        productionPlanId: planId,
        productionNotes: notes
      };

      try {
        const detailSearch = rootCardId ? 
          await ProductionPlanDetail.findByRootCardId(rootCardId) : 
          await ProductionPlanDetail.findBySalesOrderId(salesOrderId);
          
        if (detailSearch) {
          console.log(`[ProductionPlanController] Updating existing detail ID ${detailSearch.id} for plan ${planId}`);
          await ProductionPlanDetail.update(rootCardId || salesOrderId, detailData, !!rootCardId, detailSearch.id);
        } else {
          console.log(`[ProductionPlanController] Creating new detail for plan ${planId}`);
          await ProductionPlanDetail.create(detailData);
        }
      } catch (linkError) {
        console.error('[ProductionPlanController] Error saving details:', linkError.message);
      }

      if (finishedGoods && Array.isArray(finishedGoods)) {
        await ProductionPlan.addFinishedGoods(planId, finishedGoods);
      }

      if (stages && Array.isArray(stages)) {
        await ProductionPlan.addStages(planId, stages);
      }

      // Complete workflow task
      if (rootCardId) {
        try {
          await WorkflowTaskHelper.completeAndOpenNext(rootCardId, 'Create Production Plan');
        } catch (workflowErr) {
          console.error('[ProductionPlanController] Error completing workflow task:', workflowErr.message);
        }
      }

      res.status(201).json({
        message: 'Production plan created successfully',
        data: { 
          planId,
          planName: planName 
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating production plan', error: error.message });
    }
  },

  async getPlan(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || id === 'null') {
        return res.json(null);
      }
      
      const plan = await ProductionPlan.findById(id);

      if (!plan) {
        return res.status(404).json({ message: 'Production plan not found' });
      }

      try {
        const finishedGoods = await ProductionPlan.getFinishedGoods(plan.id);
        plan.finishedGoods = finishedGoods || [];
      } catch (fgError) {
        console.warn(`[ProductionPlanController] Could not fetch finished goods for plan ${plan.id}:`, fgError.message);
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
      
      if (!id || id === 'null') {
        return res.json(null);
      }
      
      const plan = await ProductionPlan.findById(id);

      if (!plan) {
        return res.status(404).json({ message: 'Production plan not found' });
      }

      // Ensure we have all the data from production_plan_details if findById missed it
      if (!plan.materials || plan.materials.length === 0) {
        const detail = await ProductionPlanDetail.findByProductionPlanId(plan.id);
        if (detail) {
          plan.materials = detail.materials || [];
          plan.sub_assemblies = detail.subAssemblies || [];
          plan.finished_goods = detail.finishedGoods || [];
          plan.production_notes = detail.productionNotes || plan.notes;
        }
      }

      const connection = await pool.getConnection();
      try {
        const [stages] = await connection.execute(
          `SELECT pps.*,
                  DATE_FORMAT(pps.planned_start_date, '%Y-%m-%d') as planned_start_date,
                  DATE_FORMAT(pps.planned_end_date, '%Y-%m-%d') as planned_end_date,
                  pps.target_warehouse AS targetWarehouse,
                  CONCAT(e.first_name, ' ', e.last_name) AS worker_name,
                  e.email AS worker_email
           FROM production_plan_stages pps
           LEFT JOIN employees e ON e.id = pps.assigned_employee_id
           WHERE pps.production_plan_id = ? 
           ORDER BY pps.sequence ASC`,
          [plan.id]
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
          targetWarehouse: stage.target_warehouse,
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
      const data = req.body;
      const {
        planName,
        status,
        timeline,
        estimatedCompletionDate,
        supervisorId,
        productionNotes,
        notes,
        finishedGoods,
        materials,
        subAssemblies,
        stages,
        targetQuantity
      } = req.body;

      console.log(`[ProductionPlanController] Updating plan ${id}:`, JSON.stringify(data, null, 2));

      if (!id || id === 'null') {
        return res.status(400).json({ message: 'Invalid plan ID' });
      }

      const plan = await ProductionPlan.findById(id);
      if (!plan) {
        return res.status(404).json({ message: 'Production plan not found' });
      }

      // Ensure we use the actual numeric database ID for operations
      const numericId = plan.id;

      // 1. Update main production_plans table
      await ProductionPlan.update(numericId, {
        planName: planName || plan.plan_name,
        status: status || plan.status,
        rootCardId: data.rootCardId || plan.root_card_id,
        salesOrderId: data.salesOrderId || plan.sales_order_id,
        targetQuantity: (targetQuantity !== undefined && targetQuantity !== null && targetQuantity !== '') ? targetQuantity : (data.targetQuantity !== undefined ? data.targetQuantity : (plan.target_quantity || 1)),
        plannedStartDate: data.plannedStartDate || (timeline?.startDate) || data.startDate || plan.planned_start_date,
        plannedEndDate: data.plannedEndDate || (timeline?.endDate) || data.endDate || plan.planned_end_date,
        estimatedCompletionDate: estimatedCompletionDate || data.estimatedCompletionDate || plan.estimated_completion_date,
        supervisorId: supervisorId || data.assignedSupervisor || plan.supervisor_id,
        notes: notes || productionNotes || plan.notes
      });

      // 2. Update production_plan_details (JSON data)
      const detailData = {
        ...data,
        productionPlanId: numericId,
        productionNotes: productionNotes || notes || plan.notes,
        timeline: timeline || {
          startDate: data.plannedStartDate || data.startDate || plan.planned_start_date,
          endDate: data.plannedEndDate || data.endDate || plan.planned_end_date,
          procurementStatus: status || plan.status
        }
      };

      try {
        // Try to update existing details - use rootCardId or salesOrderId as the identifier
        const detailIdToUse = plan.root_card_id || plan.sales_order_id;
        await ProductionPlanDetail.update(detailIdToUse, detailData, !!plan.root_card_id, plan.detail_id);
      } catch (detailError) {
        console.warn('[ProductionPlanController] Error updating details, trying to create instead:', detailError.message);
        try {
          await ProductionPlanDetail.create(detailData);
        } catch (createError) {
          console.error('[ProductionPlanController] Failed to create details:', createError.message);
        }
      }

      // 3. Update finished goods if provided
      if (finishedGoods && Array.isArray(finishedGoods)) {
        await ProductionPlan.addFinishedGoods(numericId, finishedGoods);
      }

      // 4. Update stages if provided
      if (stages && Array.isArray(stages)) {
        await ProductionPlan.addStages(numericId, stages);
      }

      res.json({ message: 'Production plan updated successfully' });
    } catch (error) {
      console.error('[ProductionPlanController] Error updating plan:', error);
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

      await ProductionPlan.updateStatus(plan.id, status);
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

      await ProductionPlan.delete(plan.id);
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

      await ProductionPlan.addStages(plan.id, stages);
      
      const [createdStages] = await pool.execute(
        `SELECT id, stage_name, assigned_employee_id, stage_type, sequence, is_blocked FROM production_plan_stages WHERE production_plan_id = ? ORDER BY sequence ASC`,
        [plan.id]
      );
      
      const EmployeeTask = require('../../models/EmployeeTask');
      
      if (createdStages.length > 0) {
        const firstStage = createdStages[0];
        console.log(`[ProductionPlanController] Processing first stage: ${firstStage.stage_name} (ID: ${firstStage.id})`);
        
        if (firstStage.stage_type === 'outsource') {
          try {
            console.log(`[ProductionPlanController] ✓ First stage ${firstStage.stage_name} is outsourced`);
            
            try {
              const AlertsNotification = require('../../models/AlertsNotification');
              
              const [deptMembers] = await pool.execute(`
                SELECT DISTINCT u.id 
                FROM users u
                INNER JOIN roles r ON u.role_id = r.id
                WHERE r.name = 'Production'
                LIMIT 20
              `);
              
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
          // Task creation removed as per user request to keep them only in workflow tasks
        }
      }
      
      res.status(201).json({ 
        message: 'Production plan stages created successfully',
        stageCount: stages.length 
      });
    } catch (error) {
      console.error('[ProductionPlanController] Error creating stages:', error.message);
      res.status(500).json({ message: 'Error creating production plan stages', error: error.message });
    }
  },

  async updatePlanStage(req, res) {
    try {
      const { id: stageId } = req.params;
      const { stageName, stageType, assignedEmployeeId, assignedFacilityId, plannedStartDate, plannedEndDate, targetWarehouse, notes } = req.body;

      let durationDays = null;
      if (plannedStartDate && plannedEndDate) {
        const startDate = new Date(plannedStartDate);
        const endDate = new Date(plannedEndDate);
        const timeDiff = endDate - startDate;
        durationDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      }

      let employeeId = assignedEmployeeId ? parseInt(assignedEmployeeId) : null;
      if (employeeId && employeeId > 0) {
        const [empCheck] = await pool.execute('SELECT id FROM employees WHERE id = ? AND status = "active"', [employeeId]);
        if (empCheck.length === 0) {
          employeeId = null;
        }
      } else {
        employeeId = null;
      }

      let facilityId = assignedFacilityId ? parseInt(assignedFacilityId) : null;
      if (facilityId && facilityId > 0) {
        const [facCheck] = await pool.execute('SELECT id FROM manufacturing_facilities WHERE id = ?', [facilityId]);
        if (facCheck.length === 0) {
          facilityId = null;
        }
      } else {
        facilityId = null;
      }

      const query = `
        UPDATE production_plan_stages
        SET stage_name = ?, stage_type = ?, assigned_employee_id = ?, assigned_facility_id = ?,
            planned_start_date = ?, planned_end_date = ?, duration_days = ?, target_warehouse = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await pool.execute(query, [
        stageName,
        stageType,
        employeeId,
        facilityId,
        plannedStartDate || null,
        plannedEndDate || null,
        durationDays,
        targetWarehouse || null,
        notes || null,
        stageId
      ]);

      if (stageType === 'outsource') {
        const [existingTasks] = await pool.execute(
          'SELECT id FROM outsourcing_tasks WHERE production_plan_stage_id = ?',
          [stageId]
        );

        if (existingTasks.length === 0) {
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
      console.error('[ProductionPlanController.updatePlanStage] Error updating stage:', error.message);
      res.status(500).json({ message: 'Error updating production plan stage', error: error.message });
    }
  },

  async generateWorkOrders(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { id: planId } = req.params;

      console.log(`[ProductionPlanController.generateWorkOrders] Starting for plan ID: ${planId}`);

      const plan = await ProductionPlan.findById(planId);
      if (!plan) {
        console.error(`[ProductionPlanController.generateWorkOrders] Plan ${planId} not found in database`);
        return res.status(404).json({ message: 'Production plan not found' });
      }

      console.log(`[ProductionPlanController.generateWorkOrders] Plan found:`, {
        id: plan.id,
        salesOrderId: plan.sales_order_id,
        rootCardId: plan.root_card_id,
        fgCount: plan.finished_goods?.length,
        saCount: plan.sub_assemblies?.length
      });

      // Log raw data from database to debug
      const [rawDetails] = await connection.execute(
        'SELECT id, production_plan_id, sales_order_id, root_card_id FROM production_plan_details WHERE production_plan_id = ?',
        [plan.id]
      );
      console.log(`[ProductionPlanController.generateWorkOrders] Raw details check for plan ${plan.id}:`, rawDetails);

      let projectId = plan.project_id || plan.projectId;
      if (!projectId) {
        if (plan.sales_order_id) {
          const [projects] = await connection.execute(
            'SELECT id FROM projects WHERE sales_order_id = ? LIMIT 1',
            [plan.sales_order_id]
          );
          if (projects.length > 0) {
            projectId = projects[0].id;
            console.log(`[ProductionPlanController.generateWorkOrders] Found project ID ${projectId} from sales order`);
          }
        } else if (plan.root_card_id) {
           const [rcProjects] = await connection.execute(
            'SELECT project_id FROM root_cards WHERE id = ? LIMIT 1',
            [plan.root_card_id]
          );
          if (rcProjects.length > 0) {
            projectId = rcProjects[0].project_id;
            console.log(`[ProductionPlanController.generateWorkOrders] Found project ID ${projectId} from root card`);
          }
        }
      }

      let detail = null;
      
      // Attempt 1: Check if plan object already has items (from join in findById)
      if (plan.finished_goods?.length > 0 || plan.sub_assemblies?.length > 0) {
        console.log(`[ProductionPlanController.generateWorkOrders] Found items in plan object`);
        detail = {
          finishedGoods: plan.finished_goods,
          subAssemblies: plan.sub_assemblies,
          materials: plan.materials || []
        };
      }
      
      // Attempt 2: Lookup by productionPlanId directly (MOST ACCURATE)
      if (!detail) {
        console.log(`[ProductionPlanController.generateWorkOrders] Attempting lookup by productionPlanId: ${planId}`);
        detail = await ProductionPlanDetail.findByProductionPlanId(planId);
      }

      // Attempt 3: Lookup by linked IDs fallback
      if (!detail && plan.sales_order_id) {
        console.log(`[ProductionPlanController.generateWorkOrders] Attempting lookup by Sales Order ID: ${plan.sales_order_id}`);
        detail = await ProductionPlanDetail.findBySalesOrderId(plan.sales_order_id);
      }
      
      if (!detail && plan.root_card_id) {
        console.log(`[ProductionPlanController.generateWorkOrders] Attempting lookup by Root Card ID: ${plan.root_card_id}`);
        detail = await ProductionPlanDetail.findByRootCardId(plan.root_card_id);
      }
      
      // Attempt 4: Direct database query fallback
      if (!detail) {
        console.log(`[ProductionPlanController.generateWorkOrders] Still no items, trying direct database fallback`);
        const [directDetails] = await connection.execute(
          `SELECT * FROM production_plan_details 
           WHERE (sales_order_id IS NOT NULL AND sales_order_id = ?) 
              OR (root_card_id IS NOT NULL AND root_card_id = ?)`,
          [plan.sales_order_id || -1, plan.root_card_id || -1]
        );
        
        if (directDetails.length > 0) {
          const row = directDetails[0];
          detail = ProductionPlanDetail.formatRow(row);
        }
      }

      if (detail) {
        // Standardize keys (handling both camelCase and snake_case)
        const fGoods = detail.finishedGoods || detail.finished_goods || [];
        const sAssemblies = detail.subAssemblies || detail.sub_assemblies || [];
        const mats = detail.materials || detail.materials || [];

        console.log(`[ProductionPlanController.generateWorkOrders] Final processed item counts:`, {
          fgCount: fGoods.length,
          saCount: sAssemblies.length,
          matCount: mats.length
        });

        const finishedGoods = fGoods;
        const subAssemblies = sAssemblies;

        if (finishedGoods.length === 0 && subAssemblies.length === 0) {
          console.error(`[ProductionPlanController.generateWorkOrders] CRITICAL: Item lists are empty for plan ${planId}`);
          return res.status(400).json({ 
            message: 'Production plan items (Finished Goods/Sub-assemblies) not found. Please ensure items are correctly saved to the plan before generating work orders.',
            debugInfo: { 
              planId, 
              salesOrderId: plan.sales_order_id, 
              rootCardId: plan.root_card_id,
              hasDetailRow: !!detail
            }
          });
        }

        const generatedWorkOrders = [];
        let globalIndex = 0;
        const sharedTimestamp = new Date(); // Use identical timestamp for all WOs in this batch
        
        // Fetch existing work orders to avoid duplicates
        const [existingWOs] = await connection.execute(
          'SELECT item_code FROM work_orders WHERE (sales_order_id IS NOT NULL AND sales_order_id = ?) OR (root_card_id IS NOT NULL AND root_card_id = ?)',
          [plan.sales_order_id || null, plan.root_card_id || null]
        );
        const existingItemCodes = new Set(existingWOs.map(wo => wo.item_code));

        const processItem = async (item, type) => {
          const itemCode = item.itemCode || item.item_code;
          if (!itemCode) {
            console.warn(`[ProductionPlanController.generateWorkOrders] Skipping item - No item code found:`, item);
            return null;
          }
          
          console.log(`[ProductionPlanController.generateWorkOrders] Processing ${type}: ${itemCode}`);

          if (existingItemCodes.has(itemCode)) {
            console.log(`[ProductionPlanController.generateWorkOrders] Skipping ${itemCode} - Work order already exists`);
            return null;
          }

          const itemName = item.productName || item.itemName || item.item_name || itemCode;
          const bomNo = item.bomNo || item.bom_no;
          
          let bomRef = null;
          if (bomNo && bomNo !== 'N/A') {
            const [bomRows] = await connection.execute('SELECT id FROM bill_of_materials WHERE bom_number = ?', [bomNo]);
            if (bomRows.length > 0) bomRef = bomRows[0];
          }
          
          if (!bomRef) {
            bomRef = await ComprehensiveBOM.findLatestByItemCode(itemCode);
          }
          
          if (!bomRef) {
            console.warn(`[ProductionPlanController.generateWorkOrders] No BOM found for ${itemCode}`);
            return null;
          }
          
          console.log(`[ProductionPlanController.generateWorkOrders] Found BOM ${bomRef.id} for ${itemCode}`);
          
          const bomData = await ComprehensiveBOM.fetchBOMRecursive(bomRef.id, connection);
          if (!bomData) {
            console.warn(`[ProductionPlanController.generateWorkOrders] BOM data fetch returned null for ${itemCode}`);
            return null;
          }

          console.log(`[ProductionPlanController.generateWorkOrders] BOM data fetched for ${itemCode}:`, {
            opCount: bomData?.operations?.length,
            matCount: bomData?.materials?.length,
            compCount: bomData?.components?.length
          });

          // Simplified work order number generation
          const timestamp = Date.now();
          const randomSuffix = Math.floor(Math.random() * 900) + 100;
          const workOrderNo = `WO-${timestamp}-${randomSuffix}`;
          
          console.log(`[ProductionPlanController.generateWorkOrders] Creating Work Order: ${workOrderNo}`);
          
          let workOrderId;
          try {
            // Sanitize IDs to ensure they are numeric or null
            const sId = (plan.sales_order_id && !isNaN(parseInt(plan.sales_order_id))) ? parseInt(plan.sales_order_id) : null;
            const rcId = (plan.root_card_id && !isNaN(parseInt(plan.root_card_id))) ? parseInt(plan.root_card_id) : null;
            const pId = (projectId && !isNaN(parseInt(projectId))) ? parseInt(projectId) : null;
            
            const woData = {
              workOrderNo: workOrderNo,
              salesOrderId: sId,
              rootCardId: rcId,
              productionPlanId: plan.id,
              projectId: pId,
              itemCode: itemCode,
              itemName: itemName,
              bomId: bomRef.id,
              quantity: parseFloat(item.plannedQty || item.requiredQty || item.quantity || 1),
              unit: item.uom || 'Nos',
              priority: 'medium',
              status: 'planning',
              plannedStartDate: item.startDate || item.scheduledDate || plan.planned_start_date,
              plannedEndDate: plan.planned_end_date,
              notes: `Auto-generated from Production Plan: ${plan.plan_name}`,
              createdBy: req.user?.id,
              createdAt: sharedTimestamp
            };
            
            console.log(`[ProductionPlanController.generateWorkOrders] WO Payload for ${itemCode}:`, JSON.stringify(woData, null, 2));
            
            workOrderId = await WorkOrder.create(woData, connection);
            console.log(`[ProductionPlanController.generateWorkOrders] SUCCESS: Work order created with ID: ${workOrderId}`);
            
            // REMOVED delay to ensure items in same plan have same created_at for better sorting
          } catch (createErr) {
            console.error(`[ProductionPlanController.generateWorkOrders] DATABASE INSERT FAILED for Work Order (${itemCode}):`, createErr);
            throw new Error(`Work Order INSERT failed for ${itemCode}: ${createErr.sqlMessage || createErr.message}`);
          }

          const multiplier = parseFloat(item.plannedQty || item.requiredQty || item.quantity || 1);

          // Add operations from BOM
          if (bomData.operations && bomData.operations.length > 0) {
            console.log(`[ProductionPlanController.generateWorkOrders] Creating ${bomData.operations.length} operations for WO ${workOrderId}...`);
            for (let i = 0; i < bomData.operations.length; i++) {
              const op = bomData.operations[i];
              const opName = op.operationName || op.operation_name || op.name;
              
              if (!opName) {
                console.warn(`[ProductionPlanController.generateWorkOrders] Skipping operation with no name at index ${i} for ${itemCode}`);
                continue;
              }

              try {
                await WorkOrder.createOperation({
                  workOrderId,
                  operationName: opName,
                  workstation: op.workstation,
                  type: op.type || 'in-house',
                  sequence: op.sequence || (i + 1),
                  status: 'pending',
                  notes: op.description || op.notes
                }, connection);
              } catch (opErr) {
                console.error(`[ProductionPlanController.generateWorkOrders] Failed to create operation "${opName}" for WO ${workOrderId}:`, opErr.message);
                // We don't throw here to allow the process to continue, but we log it for debugging
              }
            }
          }

          // Add materials from BOM
          if (bomData.materials && bomData.materials.length > 0) {
            console.log(`[ProductionPlanController.generateWorkOrders] Creating ${bomData.materials.length} inventory items (mats) for WO ${workOrderId}...`);
            for (const mat of bomData.materials) {
              const matCode = mat.itemCode || mat.item_code || mat.specification;
              
              if (!matCode) {
                console.warn(`[ProductionPlanController.generateWorkOrders] Skipping material with no code for ${itemCode}`);
                continue;
              }

              try {
                await WorkOrder.createInventory({
                  workOrderId,
                  itemCode: matCode,
                  itemName: mat.itemName || mat.item_name || mat.specification || matCode,
                  requiredQty: (parseFloat(mat.quantity || mat.required_qty) || 0) * multiplier,
                  unit: mat.uom || 'Nos',
                  sourceWarehouse: mat.warehouse || mat.source_warehouse
                }, connection);
              } catch (matErr) {
                console.error(`[ProductionPlanController.generateWorkOrders] Failed to create inventory item "${matCode}" for WO ${workOrderId}:`, matErr.message);
                // Log and continue
              }
            }
          }

          // Also check for 'components' as they might be used instead of 'materials' in some BOM structures
          if (bomData.components && bomData.components.length > 0) {
            console.log(`[ProductionPlanController.generateWorkOrders] Creating ${bomData.components.length} inventory items (components) for WO ${workOrderId}...`);
            for (const comp of bomData.components) {
              const compCode = comp.itemCode || comp.item_code;
              
              if (!compCode) continue;

              try {
                await WorkOrder.createInventory({
                  workOrderId,
                  itemCode: compCode,
                  itemName: comp.itemName || comp.item_name || compCode,
                  requiredQty: (parseFloat(comp.quantity || comp.required_qty) || 0) * multiplier,
                  unit: comp.uom || 'Nos',
                  sourceWarehouse: comp.warehouse || comp.source_warehouse
                }, connection);
              } catch (compErr) {
                console.error(`[ProductionPlanController.generateWorkOrders] Failed to create inventory component "${compCode}" for WO ${workOrderId}:`, compErr.message);
              }
            }
          }

          return { id: workOrderId, type, item: itemName, workOrderNo };
        };

        for (let i = 0; i < subAssemblies.length; i++) {
          const result = await processItem(subAssemblies[i], 'Sub-assembly');
          if (result) generatedWorkOrders.push(result);
        }

        for (let i = 0; i < finishedGoods.length; i++) {
          const result = await processItem(finishedGoods[i], 'Finished Good');
          if (result) generatedWorkOrders.push(result);
        }

        await connection.commit();
        
        // Complete the workflow task if it exists
        if (plan.root_card_id || plan.sales_order_id) {
          try {
            const rcId = plan.root_card_id || plan.sales_order_id;
            await WorkflowTaskHelper.completeAndOpenNext(rcId, 'Generate Work Orders', connection);
            console.log(`[ProductionPlanController.generateWorkOrders] Completed workflow task for ${rcId}`);
          } catch (wfErr) {
            console.warn(`[ProductionPlanController.generateWorkOrders] Could not complete workflow task:`, wfErr.message);
          }
        }
        
        const message = generatedWorkOrders.length > 0 
          ? `Successfully generated ${generatedWorkOrders.length} work orders.`
          : `No new work orders were generated (they may already exist).`;

        res.json({
          success: true,
          message: message,
          data: generatedWorkOrders
        });
      } else {
        // This case should be handled by Attempt 3, but just in case
        throw new Error('Could not find production plan items in database.');
      }
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('[ProductionPlanController.generateWorkOrders] CRITICAL ERROR:', error);
      
      // Log to a temporary file for debugging
      try {
        const fs = require('fs');
        const logMsg = `\n[${new Date().toISOString()}] ERROR in generateWorkOrders:\nMessage: ${error.message}\nStack: ${error.stack}\n`;
        fs.appendFileSync('d:/passion/Sterling-erp/backend/error_log.txt', logMsg);
      } catch (e) {}

      res.status(500).json({ 
        message: 'Error generating work orders', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },

  async sendMaterialRequest(req, res) {
    try {
      const { id: planId } = req.params;
      console.log(`[ProductionPlanController.sendMaterialRequest] Starting for plan ID: ${planId}`);

      const plan = await ProductionPlan.findById(planId);
      if (!plan) {
        return res.status(404).json({ message: 'Production plan not found' });
      }

      // Fetch items for the plan
      const detail = await ProductionPlanDetail.findByProductionPlanId(plan.id);
      
      if (!detail || ((!detail.materials || detail.materials.length === 0) && (!detail.subAssemblies || detail.subAssemblies.length === 0))) {
        return res.status(400).json({ 
          message: 'No materials or sub-assemblies found in this production plan to request.' 
        });
      }

      // Combine materials and sub-assemblies for the request
      const items = [];
      
      if (detail.materials && Array.isArray(detail.materials)) {
        detail.materials.forEach(m => {
          items.push({
            materialCode: m.itemCode || m.materialCode,
            materialName: m.itemName || m.materialName || m.itemCode,
            quantity: m.requiredQty || m.quantity || 1,
            unit: m.uom || m.unit || 'Nos',
            specification: m.specification || m.notes || null
          });
        });
      }

      if (detail.subAssemblies && Array.isArray(detail.subAssemblies)) {
        detail.subAssemblies.forEach(sa => {
          items.push({
            materialCode: sa.itemCode || sa.componentCode,
            materialName: sa.productName || sa.itemName || sa.itemCode,
            quantity: sa.requiredQty || sa.quantity || 1,
            unit: sa.uom || sa.unit || 'Nos',
            specification: sa.bomNo || null
          });
        });
      }

      if (items.length === 0) {
        return res.status(400).json({ message: 'No valid items found to create a material request.' });
      }

      // Create the Material Request
      const mrData = {
        productionPlanId: planId,
        rootCardId: plan.sales_order_id || plan.root_card_id || null,
        department: 'Production',
        purpose: 'Material Issue',
        status: 'submitted',
        createdBy: req.user?.id,
        items: items,
        remarks: `Generated from Production Plan: ${plan.plan_name || planId}`
      };

      const mrId = await MaterialRequest.create(mrData);
      
      // Update plan status if needed (optional)
      // await ProductionPlan.updateStatus(planId, 'material_requested');

      res.status(201).json({
        success: true,
        message: 'Material request sent successfully',
        data: { materialRequestId: mrId }
      });

    } catch (error) {
      console.error('[ProductionPlanController.sendMaterialRequest] Error:', error);
      res.status(500).json({ 
        message: 'Error sending material request', 
        error: error.message 
      });
    }
  }
};

module.exports = productionPlanController;
