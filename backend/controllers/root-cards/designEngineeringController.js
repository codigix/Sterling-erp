const DesignEngineeringDetail = require('../../models/DesignEngineeringDetail');
const RootCardStep = require('../../models/RootCardStep');
const WorkflowTaskHelper = require('../../utils/workflowTaskHelper');
const { validateDesignEngineering } = require('../../utils/rootCardValidators');
const { formatSuccessResponse, formatErrorResponse } = require('../../utils/rootCardHelpers');

class DesignEngineeringController {
  static async createOrUpdate(req, res) {
    try {
      const { rootCardId } = req.params;
      const data = req.body;
      const { assignedTo } = req.body;
      const userId = req.user?.id || req.user?.userId;

      console.log(`[createOrUpdate] ===== START for Root Card ${rootCardId} =====`);
      console.log(`[createOrUpdate] Data attachments:`, JSON.stringify({
        documents: data.attachments?.documents?.length || 0,
        drawings: data.attachments?.drawings?.length || 0
      }, null, 2));
      if (data.attachments?.documents?.length > 0) {
        console.log(`[createOrUpdate] Sample document:`, JSON.stringify(data.attachments.documents[0], null, 2));
      }
      if (data.attachments?.drawings?.length > 0) {
        console.log(`[createOrUpdate] Sample drawing:`, JSON.stringify(data.attachments.drawings[0], null, 2));
      }

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
        console.log(`[createOrUpdate] Updating existing design detail`);
        await DesignEngineeringDetail.update(rootCardId, data);
      } else {
        console.log(`[createOrUpdate] Creating new design detail`);
        data.rootCardId = rootCardId;
        await DesignEngineeringDetail.create(data);
      }
      console.log(`[createOrUpdate] ===== END (saved successfully) =====`);

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
        // Task creation removed as per user request to keep them only in workflow tasks
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

      // Complete "Verify and approve design" workflow task
      await WorkflowTaskHelper.completeAndOpenNext(rootCardId, 'Verify and approve design');

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
      let { type } = req.body; // 'drawings' or 'documents'
      const files = req.files || [];
      const userId = req.user?.id || req.user?.userId;

      // Normalize type value - handle case variations
      if (type) {
        type = String(type).toLowerCase().trim();
        if (type === 'drawing' || type === 'raw-designs') type = 'drawings';
        if (type === 'document' || type === 'required-docs') type = 'documents';
      }

      console.log(`[uploadDesignDocuments] ===== UPLOAD START =====`);
      console.log(`[uploadDesignDocuments] Root Card: ${rootCardId}, Type: ${type}, Files: ${files.length}, User ID: ${userId}`);
      console.log(`[uploadDesignDocuments] req.user:`, req.user);
      console.log(`[uploadDesignDocuments] req.user?.id:`, req.user?.id);
      console.log(`[uploadDesignDocuments] req.user?.userId:`, req.user?.userId);
      console.log(`[uploadDesignDocuments] File details:`, files.map(f => ({ originalname: f.originalname, path: f.path, size: f.size, mimetype: f.mimetype })));

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
      console.log(`[uploadDesignDocuments] Starting file processing loop, files count: ${files.length}`);
      for (const file of files) {
        console.log(`[uploadDesignDocuments] Processing file: ${file.originalname}, isDraft: ${isDraft}`);
        if (!isDraft) {
          const nodePath = require('path');
          const relativePath = nodePath.relative(nodePath.join(__dirname, '../../'), file.path)
            .replace(/\\/g, '/');
          console.log(`[uploadDesignDocuments] Absolute path: ${file.path}`);
          console.log(`[uploadDesignDocuments] Relative path: ${relativePath}`);
          
          const doc = await DesignEngineeringDetail.addDocument(rootCardId, {
            name: file.originalname,
            path: relativePath,
            size: file.size,
            mimeType: file.mimetype,
            uploadedBy: userId
          }, type); // Pass the type here
          
          console.log(`[uploadDesignDocuments] ✓ Document added to DB. Returned doc:`, JSON.stringify(doc, null, 2));
          uploadedDocs.push(doc);
        } else {
          // For drafts, we just return the file info. 
          // The frontend will save it to the draft via updateDraft call on Next.
          const nodePath = require('path');
          const relativePath = nodePath.relative(nodePath.join(__dirname, '../../'), file.path)
            .replace(/\\/g, '/');
          
          uploadedDocs.push({
            id: Date.now() + Math.random(),
            name: file.originalname,
            path: relativePath,
            size: file.size,
            mimeType: file.mimetype,
            uploadedAt: new Date().toISOString(),
            uploadedBy: userId,
            type: type // Keep track of type for drafts too
          });
        }
        
        // Create Drawing or Specification records for generic viewing - for both draft and real root cards
        try {
          console.log(`[uploadDesignDocuments] Processing file: ${file.originalname}, Type: ${type}`);
          const nodePath = require('path');
          const relativeFilePath = nodePath.relative(nodePath.join(__dirname, '../../'), file.path)
            .replace(/\\/g, '/');
          
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
            
            const drawingData = {
              rootCardId: rootCardId,
              name: file.originalname,
              drawingNumber: `UPLOAD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: '2D',
              version: 'V1.0',
              status: 'Draft',
              remarks: 'Uploaded from Root Card Step 2',
              filePath: relativeFilePath,
              format: format,
              size: sizeString,
              uploadedBy: userId
            };
            
            console.log(`[uploadDesignDocuments] Creating Drawing with data:`, JSON.stringify(drawingData, null, 2));
            const drawingId = await Drawing.create(drawingData);
            console.log(`[uploadDesignDocuments] ✓ Created Drawing record ${drawingId} for: ${file.originalname}`);
          } else if (type === 'documents') {
            const Specification = require('../../models/Specification');
            const specData = {
              rootCardId: rootCardId,
              title: file.originalname,
              description: 'Uploaded from Root Card Step 2',
              version: 'v1.0',
              filePath: relativeFilePath,
              fileName: file.originalname,
              uploadedBy: userId
            };
            
            console.log(`[uploadDesignDocuments] Creating Specification with data:`, JSON.stringify(specData, null, 2));
            const specId = await Specification.create(specData);
            console.log(`[uploadDesignDocuments] ✓ Created Specification record ${specId} for: ${file.originalname}`);
          }
        } catch (err) {
          console.error(`[uploadDesignDocuments] Error: Failed to create generic record for document: ${file.originalname}`);
          console.error(`[uploadDesignDocuments] Error message:`, err.message);
          console.error(`[uploadDesignDocuments] Error code:`, err.code);
          console.error(`[uploadDesignDocuments] Error SQL:`, err.sql);
          console.error(`[uploadDesignDocuments] Error stack:`, err.stack);
        }
      }

      const updated = !isDraft ? await DesignEngineeringDetail.findByRootCardId(rootCardId) : null;
      
      console.log(`[uploadDesignDocuments] ===== UPLOAD COMPLETE =====`);
      console.log(`[uploadDesignDocuments] Total uploaded: ${uploadedDocs.length}`);
      console.log(`[uploadDesignDocuments] Uploaded docs:`, JSON.stringify(uploadedDocs, null, 2));
      
      const responseData = {
        uploaded: uploadedDocs,
        design: updated
      };
      
      console.log(`[uploadDesignDocuments] RESPONSE BEING SENT:`, JSON.stringify(responseData, null, 2));
      
      res.json(formatSuccessResponse(responseData, `${uploadedDocs.length} document(s) uploaded successfully${isDraft ? ' (Draft)' : ''}`));
    } catch (error) {
      console.error('[uploadDesignDocuments] ✗ FATAL ERROR during upload:');
      console.error('[uploadDesignDocuments] Error message:', error.message);
      console.error('[uploadDesignDocuments] Error stack:', error.stack);
      console.error('[uploadDesignDocuments] Full error:', error);
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

  static async downloadDocument(req, res) {
    try {
      const { rootCardId, documentId } = req.params;
      const fs = require('fs');
      const path = require('path');

      const documents = await DesignEngineeringDetail.getDocuments(rootCardId);
      const document = documents.find(doc => doc.id == documentId);

      if (!document) {
        return res.status(404).json(formatErrorResponse('Document not found'));
      }

      const relativeFilePath = document.path;
      const fullPath = path.join(__dirname, '../../', relativeFilePath);
      
      if (!fs.existsSync(fullPath)) {
        console.error(`[downloadDocument] File not found at path: ${fullPath}`);
        return res.status(404).json(formatErrorResponse('File not found on disk'));
      }

      const filename = path.basename(fullPath);
      res.setHeader('Content-Disposition', `attachment; filename="${document.name || filename}"`);
      res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
      
      const fileStream = fs.createReadStream(fullPath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('[downloadDocument] Error:', error.message);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async downloadDrawing(req, res) {
    try {
      const { rootCardId, drawingId } = req.params;
      const fs = require('fs');
      const path = require('path');

      const drawings = await DesignEngineeringDetail.getDrawings(rootCardId);
      const drawing = drawings.find(d => d.id == drawingId);

      if (!drawing) {
        return res.status(404).json(formatErrorResponse('Drawing not found'));
      }

      const relativeFilePath = drawing.path;
      const fullPath = path.join(__dirname, '../../', relativeFilePath);
      
      if (!fs.existsSync(fullPath)) {
        console.error(`[downloadDrawing] File not found at path: ${fullPath}`);
        return res.status(404).json(formatErrorResponse('File not found on disk'));
      }

      const filename = path.basename(fullPath);
      res.setHeader('Content-Disposition', `attachment; filename="${drawing.name || filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      const fileStream = fs.createReadStream(fullPath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('[downloadDrawing] Error:', error.message);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async approveDocument(req, res) {
    try {
      const { rootCardId, documentId } = req.params;
      const { comments } = req.body;
      const userId = req.user?.id || req.user?.userId;

      console.log(`[approveDocument] Root Card: ${rootCardId}, Document ID: ${documentId}`);

      const documents = await DesignEngineeringDetail.getDocuments(rootCardId);
      // Use loose equality for comparison as ID might be string from URL and number in array
      const docIndex = documents.findIndex(d => String(d.id) === String(documentId));

      if (docIndex === -1) {
        console.warn(`[approveDocument] Document ${documentId} not found in root card ${rootCardId}`);
        return res.status(404).json(formatErrorResponse('Document not found'));
      }

      documents[docIndex].status = 'approved';
      documents[docIndex].approvedBy = userId;
      documents[docIndex].approvedAt = new Date().toISOString();
      documents[docIndex].approvalComments = comments || null;

      await DesignEngineeringDetail.updateDocuments(rootCardId, documents);

      // Check and complete "Approve Documents" workflow task
      await WorkflowTaskHelper.checkAndCompleteApproveDocuments(rootCardId);

      res.json(formatSuccessResponse(documents[docIndex], 'Document approved'));
    } catch (error) {
      console.error('[approveDocument] Error:', error.message);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async rejectDocument(req, res) {
    try {
      const { rootCardId, documentId } = req.params;
      const { comments } = req.body;
      const userId = req.user?.id || req.user?.userId;

      console.log(`[rejectDocument] Root Card: ${rootCardId}, Document ID: ${documentId}`);

      const documents = await DesignEngineeringDetail.getDocuments(rootCardId);
      const docIndex = documents.findIndex(d => String(d.id) === String(documentId));

      if (docIndex === -1) {
        console.warn(`[rejectDocument] Document ${documentId} not found in root card ${rootCardId}`);
        return res.status(404).json(formatErrorResponse('Document not found'));
      }

      documents[docIndex].status = 'rejected';
      documents[docIndex].rejectedBy = userId;
      documents[docIndex].rejectedAt = new Date().toISOString();
      documents[docIndex].rejectionComments = comments || null;

      await DesignEngineeringDetail.updateDocuments(rootCardId, documents);

      res.json(formatSuccessResponse(documents[docIndex], 'Document rejected'));
    } catch (error) {
      console.error('[rejectDocument] Error:', error.message);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async approveDrawing(req, res) {
    try {
      const { rootCardId, drawingId } = req.params;
      const { comments } = req.body;
      const userId = req.user?.id || req.user?.userId;

      console.log(`[approveDrawing] Root Card: ${rootCardId}, Drawing ID: ${drawingId}`);

      const drawings = await DesignEngineeringDetail.getDrawings(rootCardId);
      const drawingIndex = drawings.findIndex(d => String(d.id) === String(drawingId));

      if (drawingIndex === -1) {
        console.warn(`[approveDrawing] Drawing ${drawingId} not found in root card ${rootCardId}`);
        return res.status(404).json(formatErrorResponse('Drawing not found'));
      }

      drawings[drawingIndex].status = 'approved';
      drawings[drawingIndex].approvedBy = userId;
      drawings[drawingIndex].approvedAt = new Date().toISOString();
      drawings[drawingIndex].approvalComments = comments || null;

      await DesignEngineeringDetail.updateDrawings(rootCardId, drawings);

      // Check and complete "Approve Designs" workflow task
      await WorkflowTaskHelper.checkAndCompleteApproveDesigns(rootCardId);

      res.json(formatSuccessResponse(drawings[drawingIndex], 'Drawing approved'));
    } catch (error) {
      console.error('[approveDrawing] Error:', error.message);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async rejectDrawing(req, res) {
    try {
      const { rootCardId, drawingId } = req.params;
      const { comments } = req.body;
      const userId = req.user?.id || req.user?.userId;

      console.log(`[rejectDrawing] Root Card: ${rootCardId}, Drawing ID: ${drawingId}`);

      const drawings = await DesignEngineeringDetail.getDrawings(rootCardId);
      const drawingIndex = drawings.findIndex(d => String(d.id) === String(drawingId));

      if (drawingIndex === -1) {
        console.warn(`[rejectDrawing] Drawing ${drawingId} not found in root card ${rootCardId}`);
        return res.status(404).json(formatErrorResponse('Drawing not found'));
      }

      drawings[drawingIndex].status = 'rejected';
      drawings[drawingIndex].rejectedBy = userId;
      drawings[drawingIndex].rejectedAt = new Date().toISOString();
      drawings[drawingIndex].rejectionComments = comments || null;

      await DesignEngineeringDetail.updateDrawings(rootCardId, drawings);

      res.json(formatSuccessResponse(drawings[drawingIndex], 'Drawing rejected'));
    } catch (error) {
      console.error('[rejectDrawing] Error:', error.message);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = DesignEngineeringController;
