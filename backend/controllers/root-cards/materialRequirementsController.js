const MaterialRequirementsDetail = require('../../models/MaterialRequirementsDetail');
const Material = require('../../models/Material');
const RootCardStep = require('../../models/RootCardStep');
const { validateMaterialRequirements } = require('../../utils/rootCardValidators');
const { formatSuccessResponse, formatErrorResponse } = require('../../utils/rootCardHelpers');

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
      const { rootCardId } = req.params;
      const data = req.body;
      const { assignedTo } = req.body;

      console.log(`[MaterialRequirements] createOrUpdate for RootCard ${rootCardId}`);
      console.log('  materials count:', data.materials ? (Array.isArray(data.materials) ? data.materials.length : 'not an array') : 'none');

      const validation = validateMaterialRequirements(data);
      if (!validation.isValid) {
        console.warn('Material Requirements validation warnings:', validation.errors);
      }

      console.log('  calculating cost...');
      data.totalMaterialCost = await MaterialRequirementsDetail.calculateTotalCost(data.materials);
      console.log('  total cost:', data.totalMaterialCost);

      console.log('  finding existing detail...');
      let detail = await MaterialRequirementsDetail.findByRootCardId(rootCardId);

      if (detail) {
        console.log('  updating existing detail...');
        await MaterialRequirementsDetail.update(rootCardId, data);
      } else {
        console.log('  creating new detail...');
        data.rootCardId = rootCardId;
        await MaterialRequirementsDetail.create(data);
      }

      console.log('  fetching updated detail...');
      const updated = await MaterialRequirementsDetail.findByRootCardId(rootCardId);
      
      console.log('  updating RootCardStep...');
      await RootCardStep.update(rootCardId, 3, { status: 'in_progress', data: updated, assignedTo });
      
      if (assignedTo) {
        console.log('  assigning employee...');
        await RootCardStep.assignEmployee(rootCardId, 3, assignedTo);
      }

      console.log('  success!');
      res.json(formatSuccessResponse(updated, 'Material requirements saved'));
    } catch (error) {
      console.error('[MaterialRequirements] ERROR in createOrUpdate:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getMaterialRequirements(req, res) {
    try {
      const { rootCardId } = req.params;
      const detail = await MaterialRequirementsDetail.findByRootCardId(rootCardId);
      
      if (!detail) {
        return res.json(formatSuccessResponse(null, 'Material requirements retrieved (empty)'));
      }

      // Return data exactly as stored in the project's specific record
      // to ensure total isolation between different root cards.
      res.json(formatSuccessResponse(detail, 'Material requirements retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateProcurementStatus(req, res) {
    try {
      const { rootCardId } = req.params;
      const { procurementStatus } = req.body;

      if (!procurementStatus) {
        return res.status(400).json(formatErrorResponse('Procurement status is required'));
      }

      await MaterialRequirementsDetail.updateProcurementStatus(rootCardId, procurementStatus);
      const updated = await MaterialRequirementsDetail.findByRootCardId(rootCardId);

      res.json(formatSuccessResponse(updated, 'Procurement status updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async validateMaterials(req, res) {
    try {
      const { rootCardId } = req.params;

      const detail = await MaterialRequirementsDetail.findByRootCardId(rootCardId);
      
      const errors = [];
      const warnings = [];

      if (!detail) {
        return res.json(formatSuccessResponse({
          isValid: true,
          errors: [],
          warnings: ['Material requirements not yet initialized'],
          materialData: null
        }, 'Material validation completed (no data)'));
      }

      if (!detail.materials || detail.materials.length === 0) {
        warnings.push('No materials added');
      } else {
        detail.materials.forEach((material, index) => {
          if (!material.materialType && !material.category && !material.itemGroup && !material.itemGroupName) {
            errors.push(`Material ${index + 1}: Type/Category is missing`);
          }
          if (!material.quantity || material.quantity <= 0) {
            errors.push(`Material ${index + 1}: Invalid quantity`);
          }
        });
      }

      res.json(formatSuccessResponse({
        isValid: errors.length === 0,
        errors,
        warnings,
        materialData: detail
      }, 'Material validation completed'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async calculateCosts(req, res) {
    try {
      const { rootCardId } = req.params;
      const { materials } = req.body;

      if (!materials || materials.length === 0) {
        return res.status(400).json(formatErrorResponse('Materials list is required'));
      }

      const totalCost = await MaterialRequirementsDetail.calculateTotalCost(materials);

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
      const { rootCardId } = req.params;

      const materials = await MaterialRequirementsDetail.getMaterials(rootCardId);
      res.json(formatSuccessResponse(materials, 'Materials retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async addMaterial(req, res) {
    try {
      const { rootCardId } = req.params;
      const materialData = req.body;

      if (!materialData.materialType || !materialData.quantity) {
        return res.status(400).json(formatErrorResponse('Material type and quantity are required'));
      }

      const material = await MaterialRequirementsDetail.addMaterial(rootCardId, materialData);
      const updated = await MaterialRequirementsDetail.findByRootCardId(rootCardId);

      res.json(formatSuccessResponse(updated, 'Material added successfully'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getMaterial(req, res) {
    try {
      const { rootCardId, materialId } = req.params;

      const material = await MaterialRequirementsDetail.getMaterial(rootCardId, materialId);
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
      const { rootCardId, materialId } = req.params;
      const updateData = req.body;

      await MaterialRequirementsDetail.updateMaterial(rootCardId, materialId, updateData);
      const updated = await MaterialRequirementsDetail.findByRootCardId(rootCardId);

      res.json(formatSuccessResponse(updated, 'Material updated successfully'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async removeMaterial(req, res) {
    try {
      const { rootCardId, materialId } = req.params;

      await MaterialRequirementsDetail.removeMaterial(rootCardId, materialId);
      const updated = await MaterialRequirementsDetail.findByRootCardId(rootCardId);

      res.json(formatSuccessResponse(updated, 'Material removed successfully'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async assignMaterial(req, res) {
    try {
      const { rootCardId, materialId } = req.params;
      const { assignedTo } = req.body;

      if (!assignedTo) {
        return res.status(400).json(formatErrorResponse('Assigned To is required'));
      }

      await MaterialRequirementsDetail.assignMaterial(rootCardId, materialId, assignedTo);
      const updated = await MaterialRequirementsDetail.findByRootCardId(rootCardId);

      res.json(formatSuccessResponse(updated, 'Material assigned successfully'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = MaterialRequirementsController;
