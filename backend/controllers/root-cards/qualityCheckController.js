const QualityCheckDetail = require('../../models/QualityCheckDetail');
const RootCardStep = require('../../models/RootCardStep');
const { validateQualityCheck } = require('../../utils/rootCardValidators');
const { formatSuccessResponse, formatErrorResponse } = require('../../utils/rootCardHelpers');

class QualityCheckController {
  static async createOrUpdate(req, res) {
    try {
      const { rootCardId } = req.params;
      const data = req.body;
      const { assignedTo } = req.body;

      const validation = validateQualityCheck(data);
      if (!validation.isValid) {
        console.warn('Quality Check validation warnings:', validation.errors);
      }

      let detail = await QualityCheckDetail.findByRootCardId(rootCardId);

      if (detail) {
        await QualityCheckDetail.update(rootCardId, data);
      } else {
        data.rootCardId = rootCardId;
        await QualityCheckDetail.create(data);
      }

      const updated = await QualityCheckDetail.findByRootCardId(rootCardId);
      await RootCardStep.update(rootCardId, 5, { status: 'in_progress', data: updated, assignedTo });
      
      if (assignedTo) {
        await RootCardStep.assignEmployee(rootCardId, 5, assignedTo);
        
        try {
          const RootCard = require('../../models/RootCard');
          const EmployeeTask = require('../../models/EmployeeTask');
          const pool = require('../../config/database');
          
          const rootCard = await RootCard.findById(rootCardId);
          const existingTasks = await EmployeeTask.findByRelatedId(rootCardId, 'quality_check');
          
          if (existingTasks.length === 0) {
            await EmployeeTask.createAssignedTask(assignedTo, {
              title: `Quality Check: ${rootCard?.project_name || rootCard?.title || 'Project'}`,
              description: `Perform quality check for Root Card ${rootCard?.po_number || ''}`,
              type: 'quality_check',
              priority: rootCard?.priority || 'medium',
              dueDate: rootCard?.due_date,
              salesOrderId: rootCardId,
              notes: `Auto-assigned from Admin Root Card flow`
            });
            console.log(`[QualityCheckController] ✓ Task created for employee ${assignedTo}`);
          } else {
            const task = existingTasks[0];
            if (task.employee_id !== parseInt(assignedTo)) {
              await pool.execute('UPDATE employee_tasks SET employee_id = ? WHERE id = ?', [assignedTo, task.id]);
              console.log(`[QualityCheckController] ✓ Task ${task.id} reassigned to employee ${assignedTo}`);
            }
          }
        } catch (taskError) {
          console.error('[QualityCheckController] Error handling employee task:', taskError.message);
        }
      }

      res.json(formatSuccessResponse(updated, 'Quality check data saved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getQualityCheck(req, res) {
    try {
      const { rootCardId } = req.params;
      const detail = await QualityCheckDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(detail || null, 'Quality check retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateQCStatus(req, res) {
    try {
      const { rootCardId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json(formatErrorResponse('Status is required'));
      }

      let detail = await QualityCheckDetail.findByRootCardId(rootCardId);
      if (!detail) {
        await QualityCheckDetail.create({ rootCardId, qualityCheck: { qcStatus: status } });
      } else {
        await QualityCheckDetail.updateQCStatus(rootCardId, status);
      }

      const updated = await QualityCheckDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, 'QC status updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async addCompliance(req, res) {
    try {
      const { rootCardId } = req.params;
      const complianceData = req.body;

      if (!complianceData.standard && !complianceData.qualityStandards) {
        return res.status(400).json(formatErrorResponse('Compliance data is required'));
      }

      let detail = await QualityCheckDetail.findByRootCardId(rootCardId);
      if (!detail) {
        await QualityCheckDetail.create({ rootCardId, qualityCompliance: complianceData });
      } else {
        await QualityCheckDetail.addCompliance(rootCardId, complianceData);
      }

      const updated = await QualityCheckDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Compliance added'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async addWarrantySupport(req, res) {
    try {
      const { rootCardId } = req.params;
      const warrantyData = req.body;

      let detail = await QualityCheckDetail.findByRootCardId(rootCardId);
      if (!detail) {
        await QualityCheckDetail.create({ rootCardId, warrantySupport: warrantyData });
      } else {
        await QualityCheckDetail.addWarrantySupport(rootCardId, warrantyData);
      }

      const updated = await QualityCheckDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Warranty support added'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async assignProjectOwner(req, res) {
    try {
      const { rootCardId } = req.params;
      const { ownerId } = req.body;

      if (!ownerId) {
        return res.status(400).json(formatErrorResponse('Project owner ID is required'));
      }

      let detail = await QualityCheckDetail.findByRootCardId(rootCardId);
      if (!detail) {
        await QualityCheckDetail.create({ rootCardId, internalProjectOwner: ownerId });
      } else {
        await QualityCheckDetail.assignProjectOwner(rootCardId, ownerId);
      }

      const updated = await QualityCheckDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Project owner assigned'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async validateCompliance(req, res) {
    try {
      const { rootCardId } = req.params;

      const detail = await QualityCheckDetail.findByRootCardId(rootCardId);
      
      const errors = [];
      const warnings = [];

      if (!detail) {
        return res.json(formatSuccessResponse({
          isValid: true,
          errors: [],
          warnings: ['Quality check data not yet initialized'],
          complianceData: null
        }, 'Compliance validation completed (no data)'));
      }

      if (!detail.qualityCompliance || Object.keys(detail.qualityCompliance).length === 0) {
        warnings.push('No quality compliance standards specified');
      }

      if (!detail.warrantySupport || Object.keys(detail.warrantySupport).length === 0) {
        warnings.push('No warranty support information provided');
      }

      res.json(formatSuccessResponse({
        isValid: errors.length === 0,
        errors,
        warnings,
        complianceData: detail
      }, 'Compliance validation completed'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = QualityCheckController;
