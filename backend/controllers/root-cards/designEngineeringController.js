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
      const userId = req.user?.id || req.user?.userId;

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

      // Create Drawing and Specification records from attachments
      try {
        if (data.attachments) {
          const Drawing = require('../../models/Drawing');
          const Specification = require('../../models/Specification');
          
          // Process drawings
          if (Array.isArray(data.attachments.drawings) && data.attachments.drawings.length > 0) {
            for (const drawing of data.attachments.drawings) {
              // Check if it's a file object (has name property) or already a record
              if (drawing.name && !drawing.id) {
                try {
                  const format = drawing.type ? drawing.type.toUpperCase() : 'PDF';
                  const sizeInBytes = drawing.size || 0;
                  let sizeString = '';
                  if (sizeInBytes > 0) {
                    if (sizeInBytes < 1024) {
                      sizeString = sizeInBytes + ' B';
                    } else if (sizeInBytes < 1024 * 1024) {
                      sizeString = (sizeInBytes / 1024).toFixed(1) + ' KB';
                    } else {
                      sizeString = (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB';
                    }
                  }

                  await Drawing.create({
                    rootCardId: rootCardId,
                    name: drawing.name,
                    drawingNumber: `WIZARD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: '2D',
                    version: 'V1.0',
                    status: 'Draft',
                    remarks: 'Uploaded from Root Card Wizard Step 2',
                    filePath: drawing.path || drawing.filePath || '',
                    format: format,
                    size: sizeString,
                    uploadedBy: userId
                  });
                  console.log(`[DesignEngineeringController] ✓ Created Drawing record from attachment: ${drawing.name}`);
                } catch (err) {
                  console.warn(`[DesignEngineeringController] Warning: Could not create Drawing record for ${drawing.name}:`, err.message);
                }
              }
            }
          }
          
          // Process documents/specifications
          if (Array.isArray(data.attachments.documents) && data.attachments.documents.length > 0) {
            for (const doc of data.attachments.documents) {
              // Check if it's a file object (has name property) or already a record
              if (doc.name && !doc.id) {
                try {
                  await Specification.create({
                    rootCardId: rootCardId,
                    title: doc.name,
                    description: 'Uploaded from Root Card Wizard Step 2',
                    version: 'v1.0',
                    filePath: doc.path || doc.filePath || '',
                    fileName: doc.name,
                    uploadedBy: userId,
                    status: 'Draft'
                  });
                  console.log(`[DesignEngineeringController] ✓ Created Specification record from attachment: ${doc.name}`);
                } catch (err) {
                  console.warn(`[DesignEngineeringController] Warning: Could not create Specification record for ${doc.name}:`, err.message);
                }
              }
            }
          }
        }
      } catch (attachmentErr) {
        console.error('[DesignEngineeringController] Error processing attachments:', attachmentErr.message);
        // Don't fail the entire request because of attachment processing errors
      }

      const updated = await DesignEngineeringDetail.findByRootCardId(rootCardId);
      await RootCardStep.update(rootCardId, 2, { status: 'in_progress', data: updated, assignedTo });
      
      if (assignedTo) {
        await RootCardStep.assignEmployee(rootCardId, 2, assignedTo);
        
        try {
          const EmployeeTask = require('../../models/EmployeeTask');
          const pool = require('../../config/database');
          const productionController = require('../production/productionController');
          
          // Create workflow based tasks automatically if an employee is assigned
          const connection = await pool.getConnection();
          try {
            await connection.beginTransaction();
            const created = await productionController.internalCreateWorkflowTasks(rootCardId, assignedTo, connection);
            await connection.commit();
            console.log(`[DesignEngineeringController] ✓ Generated ${created.length} workflow tasks for employee ${assignedTo}`);
          } catch (workflowError) {
            await connection.rollback();
            throw workflowError;
          } finally {
            connection.release();
          }
          
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
      console.log(`[getDesignEngineering] Root Card ${rootCardId}:`, design ? 'Found' : 'Not found');
      if (design && design.documents) {
        console.log(`[getDesignEngineering] Documents count: ${design.documents.length}`);
      }
      if (design && design.drawings3D) {
        console.log(`[getDesignEngineering] Drawings count: ${design.drawings3D.length}`);
      }
      res.json(formatSuccessResponse(design || null, 'Design retrieved'));
    } catch (error) {
      console.error('[getDesignEngineering] Error:', error.message);
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
      const { type } = req.body; // 'drawings' or 'documents'
      const files = req.files || [];
      const userId = req.user?.id || req.user?.userId;

      console.log(`[uploadDesignDocuments] Root Card: ${rootCardId}, Type: ${type}, Files: ${files.length}, User: ${userId}`);

      if (!files || files.length === 0) {
        console.warn(`[uploadDesignDocuments] No files received for root card ${rootCardId}`);
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
          }, type); // Pass the type here
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
            uploadedBy: userId,
            type: type // Keep track of type for drafts too
          });
        }
        
        // Create Drawing or Specification records for generic viewing - for both draft and real root cards
        try {
          if (type === 'drawings') {
            const Drawing = require('../../models/Drawing');
            const fileSizeInBytes = file.size;
            let sizeString = '';
            if (fileSizeInBytes < 1024) {
              sizeString = fileSizeInBytes + ' B';
            } else if (fileSizeInBytes < 1024 * 1024) {
              sizeString = (fileSizeInBytes / 1024).toFixed(1) + ' KB';
            } else {
              sizeString = (fileSizeInBytes / (1024 * 1024)).toFixed(1) + ' MB';
            }
            
            const path = require('path');
            const format = path.extname(file.originalname).substring(1).toUpperCase();
            
            await Drawing.create({
              rootCardId: rootCardId,
              name: file.originalname,
              drawingNumber: `UPLOAD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: '2D',
              version: 'V1.0',
              status: 'Draft',
              remarks: 'Uploaded from Root Card Step 2',
              filePath: file.path,
              format: format,
              size: sizeString,
              uploadedBy: userId
            });
            console.log(`[DesignEngineeringController] ✓ Created Drawing record for: ${file.originalname}`);
          } else if (type === 'documents') {
            const Specification = require('../../models/Specification');
            await Specification.create({
              rootCardId: rootCardId,
              title: file.originalname,
              description: 'Uploaded from Root Card Step 2',
              version: 'v1.0',
              filePath: file.path,
              fileName: file.originalname,
              uploadedBy: userId
            });
            console.log(`[DesignEngineeringController] ✓ Created Specification record for: ${file.originalname}`);
          }
        } catch (err) {
          console.error(`[DesignEngineeringController] Error: Failed to create generic record for document: ${file.originalname}`, err.message);
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

  static async getRawDesigns(req, res) {
    try {
      const { rootCardId } = req.params;

      const drawings = await DesignEngineeringDetail.getDrawings(rootCardId);
      console.log(`[getRawDesigns] Root Card ${rootCardId}: Found ${drawings.length} drawings`);
      if (drawings.length > 0) {
        console.log(`[getRawDesigns] Sample drawing:`, JSON.stringify(drawings[0], null, 2));
      }
      res.json(formatSuccessResponse(drawings, 'Raw design drawings retrieved'));
    } catch (error) {
      console.error('[getRawDesigns] Error:', error.message);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getRequiredDocuments(req, res) {
    try {
      const { rootCardId } = req.params;

      const documents = await DesignEngineeringDetail.getDocuments(rootCardId);
      console.log(`[getRequiredDocuments] Root Card ${rootCardId}: Found ${documents.length} documents`);
      if (documents.length > 0) {
        console.log(`[getRequiredDocuments] Sample document:`, JSON.stringify(documents[0], null, 2));
      }
      res.json(formatSuccessResponse(documents, 'Required documents retrieved'));
    } catch (error) {
      console.error('[getRequiredDocuments] Error:', error.message);
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

  static async removeRawDesign(req, res) {
    try {
      const { rootCardId, drawingId } = req.params;

      await DesignEngineeringDetail.removeDrawing(rootCardId, drawingId);
      res.json(formatSuccessResponse(null, 'Raw design removed successfully'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async removeRequiredDocument(req, res) {
    try {
      const { rootCardId, documentId } = req.params;

      await DesignEngineeringDetail.removeDocument(rootCardId, documentId);
      res.json(formatSuccessResponse(null, 'Required document removed successfully'));
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
