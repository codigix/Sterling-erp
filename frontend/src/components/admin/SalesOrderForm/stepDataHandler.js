import axios from "../../../utils/api";

export const buildStepPayload = (stepNumber, formData) => {
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
      notes: formData.notes || null
    },
    
    2: {
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      estimatedEndDate: formData.estimatedEndDate,
      billingAddress: formData.billingAddress,
      shippingAddress: formData.shippingAddress,
      productDetails: formData.productDetails || {},
      qualityCompliance: formData.qualityCompliance || {},
      warrantySupport: formData.warrantySupport || {},
      paymentTerms: formData.paymentTerms || null,
      projectPriority: formData.projectPriority || null,
      totalAmount: formData.totalAmount || null,
      projectCode: formData.projectCode || null,
      internalInfo: formData.internalInfo || {},
      specialInstructions: formData.specialInstructions || null
    },
    
    3: {
      generalDesignInfo: {
        designId: formData.designEngineering?.generalDesignInfo?.designId || '',
        designStatus: formData.designEngineering?.generalDesignInfo?.designStatus || 'Pending',
        designEngineerName: formData.designEngineering?.generalDesignInfo?.designEngineerName || ''
      },
      productSpecification: {
        productName: formData.designEngineering?.productSpecification?.productName || '',
        systemLength: formData.designEngineering?.productSpecification?.systemLength || '',
        systemWidth: formData.designEngineering?.productSpecification?.systemWidth || '',
        systemHeight: formData.designEngineering?.productSpecification?.systemHeight || '',
        loadCapacity: formData.designEngineering?.productSpecification?.loadCapacity || '',
        operatingEnvironment: formData.designEngineering?.productSpecification?.operatingEnvironment || '',
        materialGrade: formData.designEngineering?.productSpecification?.materialGrade || '',
        surfaceFinish: formData.designEngineering?.productSpecification?.surfaceFinish || ''
      },
      materialsRequired: {
        steelSections: formData.designEngineering?.materialsRequired?.steelSections || [],
        plates: formData.designEngineering?.materialsRequired?.plates || [],
        fasteners: formData.designEngineering?.materialsRequired?.fasteners || [],
        components: formData.designEngineering?.materialsRequired?.components || [],
        electrical: formData.designEngineering?.materialsRequired?.electrical || [],
        consumables: formData.designEngineering?.materialsRequired?.consumables || []
      },
      attachments: {
        drawings: formData.designEngineering?.attachments?.drawings || [],
        documents: formData.designEngineering?.attachments?.documents || []
      },
      documents: [
        ...(formData.designEngineering?.attachments?.drawings?.map((f, idx) => ({
          type: 'Drawings',
          filePath: f.name || `drawing_${idx}`,
          fileName: f.name
        })) || []),
        ...(formData.designEngineering?.attachments?.documents?.map((f, idx) => ({
          type: 'PD',
          filePath: f.name || `document_${idx}`,
          fileName: f.name
        })) || [])
      ]
    },
    
    4: {
      materials: (formData.materials || []).map(material => ({
        id: material.id,
        materialType: material.materialType,
        quantity: material.quantity || 0,
        ...material
      }))
    },
    
    5: {
      timeline: {
        startDate: formData.productionStartDate,
        endDate: formData.estimatedCompletionDate
      },
      selectedPhases: formData.selectedPhases || {}
    },
    
    6: {
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
      internalProjectOwner: formData.internalProjectOwner || null
    },
    
    7: {
      deliveryTerms: {
        deliverySchedule: formData.deliveryTerms?.deliverySchedule || '',
        packagingInfo: formData.deliveryTerms?.packagingInfo || '',
        dispatchMode: formData.deliveryTerms?.dispatchMode || '',
        installationRequired: formData.deliveryTerms?.installationRequired || '',
        siteCommissioning: formData.deliveryTerms?.siteCommissioning || ''
      },
      shipment: {
        marking: formData.shipment?.marking || '',
        dismantling: formData.shipment?.dismantling || '',
        packing: formData.shipment?.packing || '',
        dispatch: formData.shipment?.dispatch || ''
      }
    },
    
    8: {
      deliveryTerms: {
        deliverySchedule: formData.deliveryTerms?.deliverySchedule || null,
        installationRequired: formData.deliveryTerms?.installationRequired || '',
        siteCommissioning: formData.deliveryTerms?.siteCommissioning || ''
      },
      warrantySupport: {
        warrantyPeriod: formData.warrantySupport?.warrantyPeriod || ''
      },
      customerContact: formData.customerContact || '',
      projectRequirements: {
        acceptanceCriteria: formData.projectRequirements?.acceptanceCriteria || ''
      },
      internalInfo: {
        projectManager: formData.internalInfo?.projectManager || '',
        productionSupervisor: formData.internalInfo?.productionSupervisor || ''
      }
    }
  };

  return payloads[stepNumber] || {};
};

export const getStepEndpoint = (stepNumber, salesOrderId) => {
  const endpoints = {
    1: `/api/sales/steps/${salesOrderId}/client-po`,
    2: `/api/sales/steps/${salesOrderId}/sales-order`,
    3: `/api/sales/steps/${salesOrderId}/design-engineering`,
    4: `/api/sales/steps/${salesOrderId}/material-requirements`,
    5: `/api/sales/steps/${salesOrderId}/production-plan`,
    6: `/api/sales/steps/${salesOrderId}/quality-check`,
    7: `/api/sales/steps/${salesOrderId}/shipment`,
    8: `/api/sales/steps/${salesOrderId}/delivery`
  };

  return endpoints[stepNumber];
};

export const saveStepDataToAPI = async (stepNumber, salesOrderId, formData) => {
  try {
    if (!salesOrderId) {
      throw new Error('Sales Order ID is required');
    }

    const payload = buildStepPayload(stepNumber, formData);
    const endpoint = getStepEndpoint(stepNumber, salesOrderId);

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
