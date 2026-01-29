const DesignEngineeringDetail = require('../../models/DesignEngineeringDetail');
const RootCardStep = require('../../models/RootCardStep');
const { validateDesignEngineering } = require('../../utils/rootCardValidators');
const { formatSuccessResponse, formatErrorResponse } = require('../../utils/rootCardHelpers');

class DesignEngineeringController {
  static async createOrUpdate(req, res) {
    try {
      const { rootCardId } = req.params;
      const data = req.body;
      const { assignedTo } = req.body;

      const RootCard = require('../../models/RootCard');
      const rootCard = await RootCard.findById(rootCardId);
      if (!rootCard) {
        return res.status(404).json(formatErrorResponse('Root Card not found'));
      }

      const validation = validateDesignEngineering(data);
      if (!validation.isValid) {
        console.warn('Design Engineering validation warnings:', validation.errors);
      }

      let designDetail = await DesignEngineeringDetail.findByRootCardId(rootCardId);

      if (designDetail) {
        await DesignEngineeringDetail.update(rootCardId, data);
      } else {
        data.rootCardId = rootCardId;
        await DesignEngineeringDetail.create(data);
      }

      const updated = await DesignEngineeringDetail.findByRootCardId(rootCardId);
      await RootCardStep.update(rootCardId, 2, { status: 'in_progress', data: updated, assignedTo });
      
      if (assignedTo) {
        await RootCardStep.assignEmployee(rootCardId, 2, assignedTo);
        
        try {
          const EmployeeTask = require('../../models/EmployeeTask');
          const pool = require('../../config/database');
          
          const existingTasks = await EmployeeTask.findByRelatedId(rootCardId, 'design_engineering');
          
          if (existingTasks.length === 0) {
            await EmployeeTask.createAssignedTask(assignedTo, {
              title: `Design Engineering: ${rootCard?.project_name || rootCard?.title || 'Project'}`,
              description: `Complete design engineering for Root Card ${rootCard?.po_number || ''}`,
              type: 'design_engineering',
              priority: rootCard?.priority || 'medium',
              dueDate: rootCard?.due_date,
              salesOrderId: rootCardId,
              notes: `Auto-assigned from Admin Root Card flow`
            });
            console.log(`[DesignEngineeringController] ✓ Task created for employee ${assignedTo}`);
          } else {
            const task = existingTasks[0];
            if (task.employee_id !== parseInt(assignedTo)) {
              await pool.execute('UPDATE employee_tasks SET employee_id = ? WHERE id = ?', [assignedTo, task.id]);
              console.log(`[DesignEngineeringController] ✓ Task ${task.id} reassigned to employee ${assignedTo}`);
            }
          }
        } catch (taskError) {
          console.error('[DesignEngineeringController] Error handling employee task:', taskError.message);
        }
      }

      res.json(formatSuccessResponse(updated, 'Design Engineering data saved'));
    } catch (error) {
      console.error('Error saving Design Engineering:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getDesignEngineering(req, res) {
    try {
      const { rootCardId } = req.params;
      const design = await DesignEngineeringDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(design || null, 'Design retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async approveDesign(req, res) {
    try {
      const { rootCardId } = req.params;
      const { reviewedBy, comments } = req.body;

      if (!reviewedBy) {
        return res.status(400).json(formatErrorResponse('Reviewer ID is required'));
      }

      await DesignEngineeringDetail.approveDesign(rootCardId, reviewedBy, comments);
      await RootCardStep.update(rootCardId, 2, { status: 'approved' });

      const updated = await DesignEngineeringDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Design approved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async rejectDesign(req, res) {
    try {
      const { rootCardId } = req.params;
      const { reviewedBy, comments } = req.body;

      if (!reviewedBy) {
        return res.status(400).json(formatErrorResponse('Reviewer ID is required'));
      }

      await DesignEngineeringDetail.rejectDesign(rootCardId, reviewedBy, comments);
      await RootCardStep.update(rootCardId, 2, { status: 'rejected' });

      const updated = await DesignEngineeringDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Design rejected'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async uploadDesignDocuments(req, res) {
    try {
      const { rootCardId } = req.params;
      const files = req.files || [];
      const userId = req.user?.id || req.user?.userId;

      if (!files || files.length === 0) {
        return res.status(400).json(formatErrorResponse('No files uploaded'));
      }

      const RootCard = require('../../models/RootCard');
      const rootCard = await RootCard.findById(rootCardId);
      
      let isDraft = false;
      if (!rootCard) {
        const RootCardDraft = require('../../models/RootCardDraft');
        const draft = await RootCardDraft.findById(rootCardId, userId);
        if (draft) {
          isDraft = true;
          console.log(`[DesignEngineeringController] Root Card ${rootCardId} not found in sales_orders, but found in drafts. Handling as draft upload.`);
        } else {
          return res.status(404).json(formatErrorResponse('Root Card not found'));
        }
      }

      let design = null;
      if (!isDraft) {
        design = await DesignEngineeringDetail.findByRootCardId(rootCardId);
        if (!design) {
          console.log(`[DesignEngineeringController] Design record not found for Root Card ${rootCardId}. Creating initial record.`);
          await DesignEngineeringDetail.create({
            rootCardId: rootCardId,
            designStatus: 'draft',
            designNotes: 'Initial record created during document upload'
          });
          design = await DesignEngineeringDetail.findByRootCardId(rootCardId);
        }
      }

      const uploadedDocs = [];
      for (const file of files) {
        if (!isDraft) {
          const doc = await DesignEngineeringDetail.addDocument(rootCardId, {
            name: file.originalname,
            path: file.path,
            size: file.size,
            mimeType: file.mimetype,
            uploadedBy: userId
          });
          uploadedDocs.push(doc);
        } else {
          // For drafts, we just return the file info. 
          // The frontend will save it to the draft via updateDraft call on Next.
          uploadedDocs.push({
            id: Date.now() + Math.random(),
            name: file.originalname,
            path: file.path,
            size: file.size,
            mimeType: file.mimetype,
            uploadedAt: new Date().toISOString(),
            uploadedBy: userId
          });
        }
      }

      const updated = !isDraft ? await DesignEngineeringDetail.findByRootCardId(rootCardId) : null;
      res.json(formatSuccessResponse({
        uploaded: uploadedDocs,
        design: updated
      }, `${uploadedDocs.length} document(s) uploaded successfully${isDraft ? ' (Draft)' : ''}`));
    } catch (error) {
      console.error('Error uploading design documents:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getDesignDocuments(req, res) {
    try {
      const { rootCardId } = req.params;

      const documents = await DesignEngineeringDetail.getDocuments(rootCardId);
      res.json(formatSuccessResponse(documents, 'Design documents retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getDesignDocument(req, res) {
    try {
      const { rootCardId, documentId } = req.params;

      const document = await DesignEngineeringDetail.getDocument(rootCardId, documentId);
      if (!document) {
        return res.status(404).json(formatErrorResponse('Document not found'));
      }

      res.json(formatSuccessResponse(document, 'Design document retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async validateDesign(req, res) {
    try {
      const { rootCardId } = req.params;

      const design = await DesignEngineeringDetail.findByRootCardId(rootCardId);
      if (!design) {
        return res.json(formatSuccessResponse({
          isValid: true,
          errors: [],
          warnings: ['Design data not yet initialized'],
          status: 'pending'
        }, 'Design validation completed (no data)'));
      }

      const validationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        status: design.designStatus
      };

      if (!design.documents || design.documents.length === 0) {
        validationResult.errors.push('No design documents uploaded');
        validationResult.isValid = false;
      }

      if (!design.designNotes || design.designNotes.trim() === '') {
        validationResult.warnings.push('Design notes are empty');
      }

      if (!design.specifications || design.specifications === null) {
        validationResult.warnings.push('Design specifications not defined');
      }

      if (!design.bomData || design.bomData === null) {
        validationResult.warnings.push('BOM data not attached to design');
      }

      res.json(formatSuccessResponse(validationResult, 'Design validation completed'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getReviewHistory(req, res) {
    try {
      const { rootCardId } = req.params;

      const history = await DesignEngineeringDetail.getApprovalHistory(rootCardId);
      res.json(formatSuccessResponse(history || [], 'Design review history retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = DesignEngineeringController;
