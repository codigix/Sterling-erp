const MaterialRequirementsDetail = require('../../models/MaterialRequirementsDetail');
const Material = require('../../models/Material');
const SalesOrderStep = require('../../models/SalesOrderStep');
const { validateMaterialRequirements } = require('../../utils/salesOrderValidators');
const { formatSuccessResponse, formatErrorResponse, calculateMaterialCost } = require('../../utils/salesOrderHelpers');

class MaterialRequirementsController {
  static async getAllRequirements(req, res) {
    try {
      const requirements = await MaterialRequirementsDetail.findAll();
      res.json(formatSuccessResponse(requirements, 'All material requirements retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async createOrUpdate(req, res) {
    try {
      const { salesOrderId } = req.params;
      const data = req.body;
      const { assignedTo } = req.body;

      console.log('[MaterialRequirements] Received data:');
      console.log('  materials type:', typeof data.materials);
      console.log('  materials value:', data.materials);
      if (data.materials) {
        console.log('  is array?', Array.isArray(data.materials));
        console.log('  length:', data.materials.length);
      }

      const validation = validateMaterialRequirements(data);
      if (!validation.isValid) {
        console.warn('Material Requirements validation warnings:', validation.errors);
      }

      data.totalMaterialCost = calculateMaterialCost(data.materials);

      let detail = await MaterialRequirementsDetail.findBySalesOrderId(salesOrderId);

      if (detail) {
        await MaterialRequirementsDetail.update(salesOrderId, data);
      } else {
        data.salesOrderId = salesOrderId;
        await MaterialRequirementsDetail.create(data);
      }

      const updated = await MaterialRequirementsDetail.findBySalesOrderId(salesOrderId);
      await SalesOrderStep.update(salesOrderId, 4, { status: 'in_progress', data: updated, assignedTo });
      
      if (assignedTo) {
        await SalesOrderStep.assignEmployee(salesOrderId, 4, assignedTo);
      }

      res.json(formatSuccessResponse(updated, 'Material requirements saved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getMaterialRequirements(req, res) {
    try {
      const { salesOrderId } = req.params;
      const detail = await MaterialRequirementsDetail.findBySalesOrderId(salesOrderId);
      
      if (!detail) {
        return res.status(404).json(formatErrorResponse('Material requirements not found'));
      }

      // Fetch live stock levels from inventory
      if (detail.materials && detail.materials.length > 0) {
        const updatedMaterials = await Promise.all(detail.materials.map(async (m) => {
          let currentStock = m.currentStock || 0;
          
          try {
            // Try by itemCode first
            let inventoryItem = null;
            if (m.itemCode && m.itemCode !== 'N/A') {
              inventoryItem = await Material.findByItemCode(m.itemCode);
            }
            
            // Fallback to name if code fails or not present
            if (!inventoryItem && m.itemName) {
              inventoryItem = await Material.findByName(m.itemName);
            }

            if (inventoryItem) {
              currentStock = inventoryItem.quantity || 0;
            }
          } catch (err) {
            console.warn(`Failed to fetch live stock for material ${m.itemName}:`, err);
          }

          return {
            ...m,
            currentStock
          };
        }));

        detail.materials = updatedMaterials;
      }

      res.json(formatSuccessResponse(detail, 'Material requirements retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateProcurementStatus(req, res) {
    try {
      const { salesOrderId } = req.params;
      const { procurementStatus } = req.body;

      if (!procurementStatus) {
        return res.status(400).json(formatErrorResponse('Procurement status is required'));
      }

      await MaterialRequirementsDetail.updateProcurementStatus(salesOrderId, procurementStatus);
      const updated = await MaterialRequirementsDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Procurement status updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async validateMaterials(req, res) {
    try {
      const { salesOrderId } = req.params;

      const detail = await MaterialRequirementsDetail.findBySalesOrderId(salesOrderId);
      if (!detail) {
        return res.status(404).json(formatErrorResponse('Material requirements not found'));
      }

      const errors = [];
      const warnings = [];

      if (!detail.materials || detail.materials.length === 0) {
        warnings.push('No materials added');
      } else {
        detail.materials.forEach((material, index) => {
          if (!material.materialType) {
            errors.push(`Material ${index + 1}: Type is missing`);
          }
          if (!material.quantity || material.quantity <= 0) {
            errors.push(`Material ${index + 1}: Invalid quantity`);
          }
        });
      }

      res.json(formatSuccessResponse({
        isValid: errors.length === 0,
        errors,
        warnings
      }, 'Material validation completed'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async calculateCosts(req, res) {
    try {
      const { salesOrderId } = req.params;
      const { materials } = req.body;

      if (!materials || materials.length === 0) {
        return res.status(400).json(formatErrorResponse('Materials list is required'));
      }

      const totalCost = calculateMaterialCost(materials);

      res.json(formatSuccessResponse({
        totalMaterialCost: totalCost,
        materials
      }, 'Material costs calculated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getMaterials(req, res) {
    try {
      const { salesOrderId } = req.params;

      const materials = await MaterialRequirementsDetail.getMaterials(salesOrderId);
      res.json(formatSuccessResponse(materials, 'Materials retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async addMaterial(req, res) {
    try {
      const { salesOrderId } = req.params;
      const materialData = req.body;

      if (!materialData.materialType || !materialData.quantity) {
        return res.status(400).json(formatErrorResponse('Material type and quantity are required'));
      }

      const material = await MaterialRequirementsDetail.addMaterial(salesOrderId, materialData);
      const updated = await MaterialRequirementsDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Material added successfully'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getMaterial(req, res) {
    try {
      const { salesOrderId, materialId } = req.params;

      const material = await MaterialRequirementsDetail.getMaterial(salesOrderId, materialId);
      if (!material) {
        return res.status(404).json(formatErrorResponse('Material not found'));
      }

      res.json(formatSuccessResponse(material, 'Material retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateMaterial(req, res) {
    try {
      const { salesOrderId, materialId } = req.params;
      const updateData = req.body;

      await MaterialRequirementsDetail.updateMaterial(salesOrderId, materialId, updateData);
      const updated = await MaterialRequirementsDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Material updated successfully'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async removeMaterial(req, res) {
    try {
      const { salesOrderId, materialId } = req.params;

      await MaterialRequirementsDetail.removeMaterial(salesOrderId, materialId);
      const updated = await MaterialRequirementsDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Material removed successfully'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async assignMaterial(req, res) {
    try {
      const { salesOrderId, materialId } = req.params;
      const { assignedTo } = req.body;

      if (!assignedTo) {
        return res.status(400).json(formatErrorResponse('Assigned To is required'));
      }

      await MaterialRequirementsDetail.assignMaterial(salesOrderId, materialId, assignedTo);
      const updated = await MaterialRequirementsDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Material assigned successfully'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = MaterialRequirementsController;
