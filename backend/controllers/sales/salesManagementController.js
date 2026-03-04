const SalesManagement = require('../../models/SalesManagement');
const ComprehensiveBOM = require('../../models/ComprehensiveBOM');
const RootCardReal = require('../../models/RootCardReal');
const ClientPODetail = require('../../models/ClientPODetail');
const DesignEngineeringDetail = require('../../models/DesignEngineeringDetail');
const Project = require('../../models/Project');
const ProductionRootCard = require('../../models/ProductionRootCard');
const productionController = require('../production/productionController');
const pool = require('../../config/database');
const AlertsNotification = require('../../models/AlertsNotification');

exports.createSalesOrder = async (req, res) => {
  try {
    const {
      rootCardId,
      bomId,
      soNumber,
      customerId,
      customerName,
      warehouseId,
      quantity,
      unitPrice,
      taxPercent,
      discount,
      status,
      orderDate,
      deliveryDate,
      notes
    } = req.body;

    const userId = req.user.id;

    if (!bomId || !soNumber || (!customerId && !customerName) || !quantity || !orderDate || !deliveryDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newSoId = await SalesManagement.create({
      rootCardId,
      bomId,
      soNumber,
      customerId,
      customerName,
      warehouseId,
      quantity,
      unitPrice,
      taxPercent,
      discount,
      status,
      orderDate,
      deliveryDate,
      notes,
      createdBy: userId
    });

    res.status(201).json({
      message: 'Sales Order created successfully',
      id: newSoId
    });
  } catch (error) {
    console.error('Create sales order error:', error.message);
    res.status(500).json({ message: 'Failed to create sales order', error: error.message });
  }
};

exports.getAllSalesOrders = async (req, res) => {
  try {
    const orders = await SalesManagement.getAll();
    res.json(orders);
  } catch (error) {
    console.error('Get sales orders error:', error.message);
    res.status(500).json({ message: 'Failed to fetch sales orders' });
  }
};

exports.getNextSONumber = async (req, res) => {
  try {
    const nextNumber = await SalesManagement.generateNextSONumber();
    res.json({ nextNumber });
  } catch (error) {
    console.error('Get next SO number error:', error.message);
    res.status(500).json({ message: 'Failed to generate next SO number' });
  }
};

exports.getRootCards = async (req, res) => {
  try {
    const rootCards = await RootCardReal.getAll();
    res.json(rootCards);
  } catch (error) {
    console.error('Get root cards error:', error.message);
    res.status(500).json({ message: 'Failed to fetch root cards' });
  }
};

exports.getRootCardDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const rootCard = await RootCardReal.findById(id);
    if (!rootCard) {
      return res.status(404).json({ message: 'Root Card not found' });
    }

    const poDetails = await ClientPODetail.findByRootCardId(id);
    const designDetails = await DesignEngineeringDetail.findByRootCardId(id);
    
    res.json({
      ...rootCard,
      poDetails,
      designDetails
    });
  } catch (error) {
    console.error('Get root card details error:', error.message);
    res.status(500).json({ message: 'Failed to fetch root card details' });
  }
};

exports.getBOMsByRootCard = async (req, res) => {
  try {
    const { id } = req.params;
    const boms = await ComprehensiveBOM.findAllByRootCardId(id);
    // Filter BOMs that are Finished Goods and are either approved or active
    const filteredBoms = boms.filter(bom => 
      (bom.status === 'approved' || bom.status === 'active') && 
      (bom.itemGroup === 'Finished Goods' || bom.itemGroup === 'Finished Good')
    );
    res.json(filteredBoms);
  } catch (error) {
    console.error('Get BOMs by root card error:', error.message);
    res.status(500).json({ message: 'Failed to fetch BOMs for root card' });
  }
};

exports.getApprovedBOMs = async (req, res) => {
  try {
    const approvedBOMs = await ComprehensiveBOM.getApproved('Finished Goods');
    res.json(approvedBOMs);
  } catch (error) {
    console.error('Get approved BOMs error:', error.message);
    res.status(500).json({ message: 'Failed to fetch approved BOMs' });
  }
};

exports.updateSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      rootCardId,
      bomId,
      soNumber,
      customerId,
      customerName,
      warehouseId,
      quantity,
      unitPrice,
      taxPercent,
      discount,
      status,
      orderDate,
      deliveryDate,
      notes
    } = req.body;

    if (!bomId || !soNumber || (!customerId && !customerName) || !quantity || !orderDate || !deliveryDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await SalesManagement.update(id, {
      rootCardId,
      bomId,
      soNumber,
      customerId,
      customerName,
      warehouseId,
      quantity,
      unitPrice,
      taxPercent,
      discount,
      status,
      orderDate,
      deliveryDate,
      notes
    });

    res.json({ message: 'Sales Order updated successfully' });
  } catch (error) {
    console.error('Update sales order error:', error.message);
    res.status(500).json({ message: 'Failed to update sales order', error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id || 1; // Fallback to 1 if req.user is missing

    console.log(`[SalesManagementController] Updating status for SO ${id} to ${status}`);

    await SalesManagement.updateStatus(id, status);

    // If sent to production, notify production managers and automate workflow
    if (status === 'Sent to Production') {
      try {
        const order = await SalesManagement.findById(id);
        if (order) {
          const rootCardId = order.root_card_id; // legacy sales_orders.id

          // 1. Ensure Project exists
          const [projects] = await pool.execute(
            'SELECT id FROM projects WHERE sales_order_id = ?',
            [rootCardId]
          );
          
          let projectId;
          if (projects.length === 0) {
            console.log(`[SalesManagementController] Creating project for SO ${id}`);
            projectId = await Project.create({
              name: order.root_card_title || `Project for SO ${order.so_number}`,
              code: order.root_card_code || `PRJ-${order.so_number}`,
              rootCardId: rootCardId,
              clientName: order.customer_name,
              poNumber: order.root_card_code,
              status: 'in_progress',
              priority: 'high'
            });
          } else {
            projectId = projects[0].id;
          }

          // 2. Ensure Production Root Card exists
          let prodRootCard = await ProductionRootCard.findBySalesOrderId(rootCardId);
          let prodRootCardId;

          if (!prodRootCard) {
            console.log(`[SalesManagementController] Creating production root card for SO ${id}`);
            prodRootCardId = await ProductionRootCard.create({
              projectId: projectId,
              rootCardId: rootCardId,
              code: order.root_card_code || `RC-${order.so_number}`,
              title: order.root_card_title || `Root Card for SO ${order.so_number}`,
              status: 'planning',
              priority: 'high',
              createdBy: userId
            });
          } else {
            prodRootCardId = prodRootCard.id;
          }

          // 3. Automate Production Workflow Tasks
          console.log(`[SalesManagementController] Automating production workflow tasks for RC ${prodRootCardId}`);
          try {
            // Check if workflow tasks already exist to avoid duplicates
            // We check for tasks linked to this production root card with production workflow type in notes
            const [existingTasks] = await pool.execute(
              'SELECT id FROM department_tasks WHERE root_card_id = ? AND JSON_EXTRACT(notes, "$.workflow_type") = ?',
              [prodRootCardId, 'production']
            );

            if (existingTasks.length === 0) {
              await productionController.internalCreateWorkflowTasks(
                prodRootCardId,
                userId,
                pool,
                'production'
              );
              console.log(`[SalesManagementController] Production workflow tasks created successfully`);
            } else {
              console.log(`[SalesManagementController] Production workflow tasks already exist, skipping creation`);
            }
          } catch (wfError) {
            console.error('[SalesManagementController] Error automating production workflow:', wfError.message);
          }

          // 4. Find ONLY Production role users to notify (Exclude Admin)
          const [productionManagers] = await pool.execute(`
            SELECT DISTINCT u.id 
            FROM users u
            INNER JOIN roles r ON u.role_id = r.id
            WHERE r.name = 'Production'
          `);

          console.log(`[SalesManagementController] Found ${productionManagers.length} production managers to notify`);

          for (const manager of productionManagers) {
            await AlertsNotification.create({
              userId: manager.id,
              fromUserId: userId,
              alertType: 'sales_order_received',
              message: `New Sales Order ${order.so_number} received from Admin. Root Card and Workflow Tasks have been automatically created.`,
              relatedTable: 'sales_orders_management',
              relatedId: id,
              priority: 'high',
              link: '/department/production/workflow-tasks'
            });
          }
        }
      } catch (automationError) {
        console.error('[SalesManagementController] Error in production automation flow:', automationError.message);
      }
    }

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('[SalesManagementController] Update status error:', error.message);
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

exports.deleteSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await SalesManagement.delete(id);
    res.json({ message: 'Sales Order deleted successfully' });
  } catch (error) {
    console.error('Delete sales order error:', error.message);
    res.status(500).json({ message: 'Failed to delete sales order' });
  }
};
