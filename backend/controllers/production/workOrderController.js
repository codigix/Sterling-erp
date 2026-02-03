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

module.exports = {
  getAllWorkOrders,
  getWorkOrderById,
  updateWorkOrder,
  deleteWorkOrder
};
