const OutsourcingTask = require('../../models/OutsourcingTask');
const OutwardChallan = require('../../models/OutwardChallan');
const InwardChallan = require('../../models/InwardChallan');
const Material = require('../../models/Material');
const Vendor = require('../../models/Vendor');
const RootCard = require('../../models/RootCard');
const pool = require('../../config/database');

const outsourcingController = {
  async getOutsourcingTasks(req, res) {
    try {
      const filters = req.query;
      const tasks = await OutsourcingTask.findAll(filters);
      res.json({ success: true, data: tasks });
    } catch (error) {
      console.error('Error fetching outsourcing tasks:', error);
      res.status(500).json({ success: false, message: 'Error fetching tasks', error: error.message });
    }
  },

  async getOutsourcingTaskById(req, res) {
    try {
      const { id } = req.params;
      const task = await OutsourcingTask.findById(id);

      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      const outwardChallans = await OutwardChallan.findByOutsourcingTaskId(id);

      let inwardChallans = [];
      if (outwardChallans.length > 0) {
        const inwardResults = await Promise.all(
          outwardChallans.map(oc => InwardChallan.findByOutwardChallanId(oc.id))
        );
        inwardChallans = inwardResults.flat();
      }

      res.json({
        success: true,
        data: {
          ...task,
          outwardChallans,
          inwardChallans
        }
      });
    } catch (error) {
      console.error('Error fetching outsourcing task:', error);
      res.status(500).json({ success: false, message: 'Error fetching task', error: error.message });
    }
  },

  async selectVendor(req, res) {
    try {
      const { taskId } = req.params;
      const { vendorId } = req.body;

      if (!vendorId) {
        return res.status(400).json({ success: false, message: 'Vendor ID is required' });
      }

      const task = await OutsourcingTask.findById(taskId);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        return res.status(404).json({ success: false, message: 'Vendor not found' });
      }

      await OutsourcingTask.selectVendor(taskId, vendorId);

      res.json({
        success: true,
        message: 'Vendor selected successfully',
        data: { taskId, vendorId, vendorName: vendor.name }
      });
    } catch (error) {
      console.error('Error selecting vendor:', error);
      res.status(500).json({ success: false, message: 'Error selecting vendor', error: error.message });
    }
  },

  async getProjectMaterials(req, res) {
    try {
      const { projectId } = req.params;

      const [materials] = await pool.execute(
        `SELECT DISTINCT inv.* 
         FROM inventory inv
         LEFT JOIN project_inventory_tasks pit ON pit.project_id = ?
         WHERE 1=1
         ORDER BY inv.item_name ASC`,
        [projectId]
      );

      res.json({
        success: true,
        data: materials || []
      });
    } catch (error) {
      console.error('Error fetching project materials:', error);
      res.status(500).json({ success: false, message: 'Error fetching materials', error: error.message });
    }
  },

  async createOutwardChallan(req, res) {
    try {
      const { taskId } = req.params;
      const { vendorId, materialSentDate, expectedReturnDate, items, notes } = req.body;

      if (!vendorId) {
        return res.status(400).json({ success: false, message: 'Vendor ID is required' });
      }

      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one material must be selected' });
      }

      const task = await OutsourcingTask.findById(taskId);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        return res.status(404).json({ success: false, message: 'Vendor not found' });
      }

      const { id: challanId, challanNumber } = await OutwardChallan.create({
        outsourcingTaskId: taskId,
        vendorId,
        materialSentDate,
        expectedReturnDate,
        notes,
        createdBy: req.user?.id
      });

      for (const item of items) {
        await OutwardChallan.addItem(challanId, {
          materialId: item.materialId,
          quantity: item.quantity,
          unit: item.unit,
          remarks: item.remarks
        });
      }

      await OutsourcingTask.updateStatus(taskId, 'outward_challan_generated');
      
      if (task.production_plan_stage_id) {
        const pool = require('../../config/database');
        await pool.execute(
          'UPDATE production_plan_stages SET status = ? WHERE id = ?',
          ['outward_challan_generated', task.production_plan_stage_id]
        );
      }

      res.json({
        success: true,
        message: 'Outward challan created successfully',
        data: {
          challanId,
          challanNumber,
          vendorName: vendor.name,
          itemCount: items.length
        }
      });
    } catch (error) {
      console.error('Error creating outward challan:', error);
      res.status(500).json({ success: false, message: 'Error creating challan', error: error.message });
    }
  },

  async getOutwardChallanDetails(req, res) {
    try {
      const { challanId } = req.params;

      const challan = await OutwardChallan.findById(challanId);
      if (!challan) {
        return res.status(404).json({ success: false, message: 'Challan not found' });
      }

      const items = await OutwardChallan.getItems(challanId);

      res.json({
        success: true,
        data: {
          ...challan,
          items
        }
      });
    } catch (error) {
      console.error('Error fetching challan details:', error);
      res.status(500).json({ success: false, message: 'Error fetching challan', error: error.message });
    }
  },

  async createInwardChallan(req, res) {
    try {
      const { outwardChallanId } = req.params;
      const { receivedDate, items, inspectionNotes, qualityStatus, notes } = req.body;

      const outwardChallan = await OutwardChallan.findById(outwardChallanId);
      if (!outwardChallan) {
        return res.status(404).json({ success: false, message: 'Outward challan not found' });
      }

      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one material receipt must be recorded' });
      }

      const { id: challanId, challanNumber } = await InwardChallan.create({
        outwardChallanId,
        receivedDate,
        receivedBy: req.user?.id,
        inspectionNotes,
        qualityStatus,
        notes
      });

      for (const item of items) {
        await InwardChallan.addItem(challanId, {
          outwardChallanItemId: item.outwardChallanItemId,
          materialId: item.materialId,
          quantityReceived: item.quantityReceived,
          quantityExpected: item.quantityExpected,
          unit: item.unit,
          qualityStatus: item.qualityStatus,
          remarks: item.remarks
        });
      }

      await OutwardChallan.updateStatus(outwardChallanId, 'received');

      const task = await OutsourcingTask.findById(outwardChallan.outsourcing_task_id);
      if (task) {
        await OutsourcingTask.updateStatus(outwardChallan.outsourcing_task_id, 'inward_challan_generated');
        
        if (task.production_plan_stage_id) {
          const pool = require('../../config/database');
          await pool.execute(
            'UPDATE production_plan_stages SET status = ? WHERE id = ?',
            ['inward_challan_generated', task.production_plan_stage_id]
          );
        }
      }

      res.json({
        success: true,
        message: 'Inward challan created successfully',
        data: {
          challanId,
          challanNumber,
          itemCount: items.length
        }
      });
    } catch (error) {
      console.error('Error creating inward challan:', error);
      res.status(500).json({ success: false, message: 'Error creating inward challan', error: error.message });
    }
  },

  async getInwardChallanDetails(req, res) {
    try {
      const { challanId } = req.params;

      const challan = await InwardChallan.findById(challanId);
      if (!challan) {
        return res.status(404).json({ success: false, message: 'Inward challan not found' });
      }

      const items = await InwardChallan.getItems(challanId);

      res.json({
        success: true,
        data: {
          ...challan,
          items
        }
      });
    } catch (error) {
      console.error('Error fetching inward challan:', error);
      res.status(500).json({ success: false, message: 'Error fetching inward challan', error: error.message });
    }
  },

  async completeOutsourcingTask(req, res) {
    try {
      const { taskId } = req.params;

      const task = await OutsourcingTask.findById(taskId);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      if (task.status !== 'inward_challan_generated') {
        return res.status(400).json({
          success: false,
          message: 'Task can only be completed after inward challan is generated'
        });
      }

      await OutsourcingTask.updateStatus(taskId, 'completed');

      const productionStageId = task.production_plan_stage_id;
      if (productionStageId) {
        await pool.execute(
          'UPDATE production_plan_stages SET status = ? WHERE id = ?',
          ['completed', productionStageId]
        );
      }

      res.json({
        success: true,
        message: 'Outsourcing task completed successfully'
      });
    } catch (error) {
      console.error('Error completing task:', error);
      res.status(500).json({ success: false, message: 'Error completing task', error: error.message });
    }
  },

  async getOutsourcingTaskByProductionStage(req, res) {
    try {
      const { stageId } = req.params;

      const task = await OutsourcingTask.findByProductionPlanStageId(stageId);
      if (!task) {
        return res.status(404).json({ success: false, message: 'No outsourcing task found for this stage' });
      }

      const outwardChallans = await OutwardChallan.findByOutsourcingTaskId(task.id);

      res.json({
        success: true,
        data: {
          ...task,
          outwardChallans
        }
      });
    } catch (error) {
      console.error('Error fetching task by stage:', error);
      res.status(500).json({ success: false, message: 'Error fetching task', error: error.message });
    }
  }
};

module.exports = outsourcingController;
