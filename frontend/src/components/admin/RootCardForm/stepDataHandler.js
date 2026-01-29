import axios from "../../../utils/api";

export const buildStepPayload = (stepNumber, formData, poDocuments = []) => {
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
      customerContact: formData.customerContact || '',
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

export const saveAllStepsToRootCard = async (rootCardId, formData, poDocuments = []) => {
  try {
    if (!rootCardId) {
      throw new Error('Root Card ID is required');
    }

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
    return summary;
  } catch (err) {
    console.error('Error saving all steps to root card:', err);
    throw err;
  }
};
