const MaterialRequirementsDetail = require('../../models/MaterialRequirementsDetail');
const Material = require('../../models/Material');
const RootCardStep = require('../../models/RootCardStep');
const { validateMaterialRequirements } = require('../../utils/rootCardValidators');
const { formatSuccessResponse, formatErrorResponse, calculateMaterialCost } = require('../../utils/rootCardHelpers');

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

      let detail = await MaterialRequirementsDetail.findByRootCardId(rootCardId);

      if (detail) {
        await MaterialRequirementsDetail.update(rootCardId, data);
      } else {
        data.rootCardId = rootCardId;
        await MaterialRequirementsDetail.create(data);
      }

      const updated = await MaterialRequirementsDetail.findByRootCardId(rootCardId);
      await RootCardStep.update(rootCardId, 3, { status: 'in_progress', data: updated, assignedTo });
      
      if (assignedTo) {
        await RootCardStep.assignEmployee(rootCardId, 3, assignedTo);
        
        try {
          const RootCard = require('../../models/RootCard');
          const EmployeeTask = require('../../models/EmployeeTask');
          const pool = require('../../config/database');
          
          const rootCard = await RootCard.findById(rootCardId);
          const existingTasks = await EmployeeTask.findByRelatedId(rootCardId, 'material_requirement');
          
          if (existingTasks.length === 0) {
            await EmployeeTask.createAssignedTask(assignedTo, {
              title: `Material Requirements: ${rootCard.project_name || rootCard.title || 'Project'}`,
              description: `Define material requirements for Root Card ${rootCard.po_number || ''}`,
              type: 'material_requirement',
              priority: rootCard.priority || 'medium',
              dueDate: rootCard.due_date,
              salesOrderId: rootCardId,
              notes: `Auto-assigned from Admin Root Card flow`
            });
            console.log(`[MaterialRequirementsController] ✓ Task created for employee ${assignedTo}`);
          } else {
            const task = existingTasks[0];
            if (task.employee_id !== parseInt(assignedTo)) {
              await pool.execute('UPDATE employee_tasks SET employee_id = ? WHERE id = ?', [assignedTo, task.id]);
              console.log(`[MaterialRequirementsController] ✓ Task ${task.id} reassigned to employee ${assignedTo}`);
            }
          }
        } catch (taskError) {
          console.error('[MaterialRequirementsController] Error handling employee task:', taskError.message);
        }
      }

      res.json(formatSuccessResponse(updated, 'Material requirements saved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getMaterialRequirements(req, res) {
    try {
      const { rootCardId } = req.params;
      const detail = await MaterialRequirementsDetail.findByRootCardId(rootCardId);
      
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
              return {
                ...m,
                currentStock: inventoryItem.quantity || 0,
                unitCost: inventoryItem.unitCost || 0,
                valuationRate: inventoryItem.valuationRate || 0,
                sellingRate: inventoryItem.sellingRate || 0,
                itemGroupId: inventoryItem.itemGroupId,
                category: inventoryItem.category,
                unit: inventoryItem.unit,
                gstPercent: inventoryItem.gstPercent
              };
            }
          } catch (err) {
            console.warn(`Failed to fetch live stock for material ${m.itemName}:`, err);
          }

          return {
            ...m,
            currentStock: m.currentStock || 0
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
      const { rootCardId } = req.params;
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
