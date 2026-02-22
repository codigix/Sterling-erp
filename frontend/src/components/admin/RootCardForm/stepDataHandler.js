import axios from "../../../utils/api";

export const buildStepPayload = (stepNumber, formData, poDocuments = []) => {
  // Helper function to clean up attachments by removing non-serializable file objects
  const cleanAttachments = (attachments) => {
    if (!attachments) return attachments;
    const cleaned = { ...attachments };
    if (cleaned.drawings) {
      cleaned.drawings = cleaned.drawings.map(d => ({
        name: d.name,
        size: d.size,
        type: d.type,
        isLocal: d.isLocal,
        // Exclude the 'file' property since it's not serializable
      }));
    }
    if (cleaned.documents) {
      cleaned.documents = cleaned.documents.map(doc => ({
        name: doc.name,
        size: doc.size,
        type: doc.type,
        isLocal: doc.isLocal,
        // Exclude the 'file' property since it's not serializable
      }));
    }
    return cleaned;
  };

  const payloads = {
    1: {
      poNumber: formData.poNumber,
      poDate: formData.poDate,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      projectName: formData.projectName,
      projectCode: formData.projectCode,
      billingAddress: formData.billingAddress,
      shippingAddress: formData.shippingAddress,
      clientAddress: formData.clientAddress || '',
      projectRequirements: formData.projectRequirements || {},
      notes: formData.notes || null,
      attachments: poDocuments,
      productDetails: {
        ...(formData.productDetails || {}),
        estimatedEndDate: formData.estimatedEndDate
      }
    },
    
    2: {
      ...(formData.designEngineering || {}),
      attachments: cleanAttachments((formData.designEngineering || {}).attachments),
      assignedTo: formData.designEngineeringAssignedTo || null
    },
    
    3: {
      materials: formData.materials || [],
      materialDetailsTable: formData.materialDetailsTable || {},
      procurementStatus: formData.procurementStatus || 'pending',
      assignedTo: formData.materialRequirementsAssignedTo || null
    },
    
    4: {
      productionStartDate: formData.productionStartDate,
      estimatedCompletionDate: formData.estimatedCompletionDate,
      procurementStatus: formData.procurementStatus,
      selectedPhases: formData.selectedPhases || {},
      phaseDetails: formData.productionPhaseDetails || {},
      assignedTo: formData.productionPlanAssignedTo || null
    },
    
    5: {
      ...formData.qualityCheck,
      qualityCompliance: {
        qualityStandards: formData.qualityCompliance?.qualityStandards || '',
        weldingStandards: formData.qualityCompliance?.weldingStandards || '',
        surfaceFinish: formData.qualityCompliance?.surfaceFinish || '',
        mechanicalLoadTesting: formData.qualityCompliance?.mechanicalLoadTesting || '',
        electricalCompliance: formData.qualityCompliance?.electricalCompliance || '',
        documentsRequired: formData.qualityCompliance?.documentsRequired || ''
      },
      warrantySupport: {
        warrantyPeriod: formData.warrantySupport?.warrantyPeriod || '',
        serviceSupport: formData.warrantySupport?.serviceSupport || ''
      },
      paymentTerms: formData.paymentTerms || null,
      totalAmount: formData.totalAmount || null,
      projectPriority: formData.projectPriority || null,
      status: formData.status || 'pending',
      internalInfo: formData.internalInfo || {},
      specialInstructions: formData.specialInstructions || null,
      internalProjectOwner: formData.internalProjectOwner || null,
      assignedTo: formData.qualityCheckAssignedTo || null
    },
    
    6: {
      deliveryTerms: formData.deliveryTerms || {},
      shipment: formData.shipment || {},
      assignedTo: formData.shipmentAssignedTo || null
    },
    
    7: {
      delivery: formData.delivery || {},
      deliveryTerms: formData.deliveryTerms || {},
      warrantySupport: formData.warrantySupport || {},
      projectRequirements: formData.projectRequirements || {},
      internalInfo: formData.internalInfo || {},
      assignedTo: formData.deliveryAssignedTo || null
    }
  };

  return payloads[stepNumber] || {};
};

export const getStepEndpoint = (stepNumber, rootCardId) => {
  const endpoints = {
    1: `/root-cards/steps/${rootCardId}/client-po`,
    2: `/root-cards/steps/${rootCardId}/design-engineering`,
    3: `/root-cards/steps/${rootCardId}/material-requirements`,
    4: `/root-cards/steps/${rootCardId}/production-plan`,
    5: `/root-cards/steps/${rootCardId}/quality-check`,
    6: `/root-cards/steps/${rootCardId}/shipment`,
    7: `/root-cards/steps/${rootCardId}/delivery`
  };

  return endpoints[stepNumber];
};

export const updateDraftWithStepData = async (draftId, formData, currentStep, poDocuments = []) => {
  try {
    if (!draftId) {
      throw new Error('Draft ID is required');
    }

    const response = await axios.put(`/root-cards/drafts/${draftId}`, {
      formData,
      currentStep,
      poDocuments
    });
    console.log(`Draft updated with step ${currentStep} data:`, response.data);
    return response.data;
  } catch (err) {
    console.error(`Error updating draft with step ${currentStep} data:`, err);
    throw err;
  }
};

export const deleteDraft = async (draftId) => {
  try {
    if (!draftId) return;
    const response = await axios.delete(`/root-cards/drafts/${draftId}`);
    console.log('Draft deleted successfully:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error deleting draft:', err);
    throw err;
  }
};

export const saveStepDataToAPI = async (stepNumber, rootCardId, formData, poDocuments = []) => {
  try {
    if (!rootCardId) {
      throw new Error('Root Card ID is required');
    }

    const payload = buildStepPayload(stepNumber, formData, poDocuments);
    const endpoint = getStepEndpoint(stepNumber, rootCardId);

    if (!endpoint) {
      throw new Error(`No endpoint configured for step ${stepNumber}`);
    }

    const response = await axios.post(endpoint, payload);
    console.log(`Step ${stepNumber} data saved successfully`, response.data);
    return response.data;
  } catch (err) {
    console.error(`Error saving step ${stepNumber} data:`, err);
    throw err;
  }
};

export const uploadWizardAttachments = async (rootCardId, formData) => {
  try {
    if (!rootCardId) {
      throw new Error('Root Card ID is required for uploading attachments');
    }

    const designEng = formData.designEngineering || {};
    const attachments = designEng.attachments || {};
    
    console.log(`[uploadWizardAttachments] Root Card: ${rootCardId}, Attachments:`, attachments);
    
    const uploadPromises = [];
    
    // Upload drawings
    if (Array.isArray(attachments.drawings) && attachments.drawings.length > 0) {
      const localDrawings = attachments.drawings.filter(d => d.isLocal && d.file);
      console.log(`[uploadWizardAttachments] Found ${localDrawings.length} local drawings out of ${attachments.drawings.length}`);
      if (localDrawings.length > 0) {
        const drawingFormData = new FormData();
        localDrawings.forEach(drawing => {
          drawingFormData.append('documents', drawing.file);
          console.log(`[uploadWizardAttachments] Adding drawing file: ${drawing.name}`);
        });
        drawingFormData.append('type', 'drawings');
        
        uploadPromises.push(
          axios.post(`/root-cards/steps/${rootCardId}/design-engineering/upload`, drawingFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          }).then(res => {
            console.log('[uploadWizardAttachments] Drawings uploaded successfully:', res.data);
            return res;
          }).catch(err => {
            console.warn('Failed to upload wizard drawings:', err.message);
            return null;
          })
        );
      }
    }
    
    // Upload documents
    if (Array.isArray(attachments.documents) && attachments.documents.length > 0) {
      const localDocs = attachments.documents.filter(d => d.isLocal && d.file);
      console.log(`[uploadWizardAttachments] Found ${localDocs.length} local documents out of ${attachments.documents.length}`);
      if (localDocs.length > 0) {
        const docFormData = new FormData();
        localDocs.forEach(doc => {
          docFormData.append('documents', doc.file);
          console.log(`[uploadWizardAttachments] Adding document file: ${doc.name}`);
        });
        docFormData.append('type', 'documents');
        
        uploadPromises.push(
          axios.post(`/root-cards/steps/${rootCardId}/design-engineering/upload`, docFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          }).then(res => {
            console.log('[uploadWizardAttachments] Documents uploaded successfully:', res.data);
            return res;
          }).catch(err => {
            console.warn('Failed to upload wizard documents:', err.message);
            return null;
          })
        );
      }
    }
    
    if (uploadPromises.length > 0) {
      const results = await Promise.all(uploadPromises);
      console.log('Wizard attachments uploaded successfully:', results);
      return results;
    }
    
    return [];
  } catch (err) {
    console.error('Error uploading wizard attachments:', err);
    throw err;
  }
};

export const saveAllStepsToRootCard = async (rootCardId, formData, poDocuments = []) => {
  try {
    if (!rootCardId) {
      throw new Error('Root Card ID is required');
    }

    console.log(`[saveAllStepsToRootCard] Starting for root card ${rootCardId}, FormData.designEngineering:`, formData.designEngineering);

    const stepPromises = [];
    for (let step = 1; step <= 7; step++) {
      stepPromises.push(saveStepDataToAPI(step, rootCardId, formData, poDocuments));
    }

    const results = await Promise.allSettled(stepPromises);
    const summary = {
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      details: results
    };
    
    console.log('All steps saved to root card:', summary);
    
    // Upload buffered wizard attachments
    try {
      console.log(`[saveAllStepsToRootCard] Calling uploadWizardAttachments for root card ${rootCardId}`);
      await uploadWizardAttachments(rootCardId, formData);
    } catch (attachErr) {
      console.warn('Warning: Could not upload wizard attachments:', attachErr.message);
    }
    
    return summary;
  } catch (err) {
    console.error('Error saving all steps to root card:', err);
    throw err;
  }
};
