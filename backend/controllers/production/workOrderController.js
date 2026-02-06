const WorkOrder = require("../../models/WorkOrder");

const getAllWorkOrders = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search
    };
    const workOrders = await WorkOrder.findAll(filters);
    res.json(workOrders);
  } catch (error) {
    console.error("Error in getAllWorkOrders:", error);
    res.status(500).json({ message: "Error fetching work orders" });
  }
};

const createWorkOrder = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user?.id
    };
    
    // Auto-generate WO number if not provided
    if (!payload.workOrderNo || payload.workOrderNo === 'WO-AUTO') {
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 900) + 100;
      payload.workOrderNo = `WO-${timestamp}-${randomSuffix}`;
    }
    
    const workOrderId = await WorkOrder.create(payload);
    res.status(201).json({ 
      message: "Work order created successfully", 
      id: workOrderId,
      workOrderNo: payload.workOrderNo
    });
  } catch (error) {
    console.error("Error in createWorkOrder:", error);
    res.status(500).json({ message: "Error creating work order", error: error.message });
  }
};

const getAllJobCards = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search
    };
    const workOrders = await WorkOrder.findAllWithOperations(filters);
    res.json(workOrders);
  } catch (error) {
    console.error("Error in getAllJobCards:", error);
    res.status(500).json({ message: "Error fetching job cards" });
  }
};

const getWorkOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ message: "Work order not found" });
    }
    res.json(workOrder);
  } catch (error) {
    console.error("Error in getWorkOrderById:", error);
    res.status(500).json({ message: "Error fetching work order" });
  }
};

const updateWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await WorkOrder.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Work order not found or no changes made" });
    }
    res.json({ message: "Work order updated successfully" });
  } catch (error) {
    console.error("Error in updateWorkOrder:", error);
    res.status(500).json({ message: "Error updating work order" });
  }
};

const deleteWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await WorkOrder.delete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Work order not found" });
    }
    res.json({ message: "Work order deleted successfully" });
  } catch (error) {
    console.error("Error in deleteWorkOrder:", error);
    res.status(500).json({ message: "Error deleting work order" });
  }
};

const createOperation = async (req, res) => {
  try {
    const operationId = await WorkOrder.createOperation(req.body);
    res.status(201).json({ 
      message: "Job card created successfully", 
      id: operationId 
    });
  } catch (error) {
    console.error("Error in createOperation:", error);
    res.status(500).json({ message: "Error creating job card" });
  }
};

const updateOperation = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await WorkOrder.updateOperation(id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Operation not found" });
    }
    res.json({ message: "Operation updated successfully" });
  } catch (error) {
    console.error("Error in updateOperation:", error);
    res.status(500).json({ message: "Error updating operation" });
  }
};

const deleteOperation = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await WorkOrder.deleteOperation(id);
    if (!deleted) {
      return res.status(404).json({ message: "Operation not found" });
    }
    res.json({ message: "Operation deleted successfully" });
  } catch (error) {
    console.error("Error in deleteOperation:", error);
    res.status(500).json({ message: "Error deleting operation" });
  }
};

module.exports = {
  getAllWorkOrders,
  createWorkOrder,
  getAllJobCards,
  getWorkOrderById,
  updateWorkOrder,
  deleteWorkOrder,
  createOperation,
  updateOperation,
  deleteOperation
};
